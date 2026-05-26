"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { updateOrderStatus } from "@/app/actions/updateOrder";
import { getSecureKitchenOrders, getSecureKitchenCustomers } from "@/app/actions/customerData";

export type Order = {
    id: string;
    customer_id: string;
    items: any[];
    total_amount: number;
    status: string;
    created_at: string;
    table_number?: string;
    order_type?: string;
    customers?: {
        name: string;
        phone: string;
        visit_count: number;
        total_spend: number;
    };
};

export type Customer = {
    id: string;
    name: string;
    phone: string;
    total_spend: number;
    visit_count: number;
};

const POLL_INTERVAL = 15000; // 15 seconds fallback polling

// Module-level set to prevent TTS duplication when hook is used by multiple components
const globalSpokenOrders = new Set<string>();

export function useDashboardData(options?: {
    skipOrders?: boolean;
    skipCustomers?: boolean;
    skipRealtime?: boolean;
}) {
    const skipOrders = options?.skipOrders ?? false;
    const skipCustomers = options?.skipCustomers ?? false;
    const skipRealtime = options?.skipRealtime ?? false;

    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [storeStatus, setStoreStatus] = useState<{ 
        isOpen: boolean, 
        message: string, 
        isManual: boolean, 
        expiresAt?: string,
        estimatedPrepTime?: number,
        activeOrders?: number
    } | null>(null);
    const [isShiftActive, setIsShiftActive] = useState(false);
    
    // Load persisted shift status on mount to prevent SSR hydration mismatches
    useEffect(() => {
        if (typeof window !== "undefined") {
            const active = sessionStorage.getItem("urban_shift_active") === "true";
            if (active) {
                setIsShiftActive(true);
            }
        }
    }, []);

    const [realtimeStatus, setRealtimeStatus] = useState<'CONNECTING' | 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'CLOSED'>('CLOSED');
    const [missedAudioQueue, setMissedAudioQueue] = useState<string[]>([]);
    const sessionStartTimeRef = useRef<Date>(new Date());

    // Phase 3: The Silent Audio Activation
    const startShift = useCallback(() => {
        sessionStartTimeRef.current = new Date(); // set start time exactly when shift starts
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance("");
            utterance.volume = 0;
            window.speechSynthesis.speak(utterance);
            sessionStorage.setItem("urban_shift_active", "true");
        }
        setIsShiftActive(true);
    }, []);

    const playMissedAudio = useCallback(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            missedAudioQueue.forEach(announcement => {
                const utterance = new SpeechSynthesisUtterance(announcement);
                window.speechSynthesis.speak(utterance);
            });
            setMissedAudioQueue([]);
        }
    }, [missedAudioQueue]);


    // Fetch all data
    const fetchOrders = useCallback(async () => {
        if (skipOrders) return;
        const res = await getSecureKitchenOrders();
        
        if (res.success && res.data) {
            const ordersData = res.data;
            // Find orders created after our session start time
            const freshOrders = ordersData.filter(order => {
                const orderTime = new Date(order.created_at);
                return orderTime > sessionStartTimeRef.current && !globalSpokenOrders.has(order.id);
            });

            if (freshOrders.length > 0 && typeof window !== "undefined" && "speechSynthesis" in window) {
                console.log(`🔔 New real-time orders detected: ${freshOrders.length}`);
                
                freshOrders.forEach((order: any) => {
                    globalSpokenOrders.add(order.id);
                    
                    // Keep memory light
                    if (globalSpokenOrders.size > 100) {
                        const iterator = globalSpokenOrders.values();
                        const val = iterator.next().value;
                        if (val) globalSpokenOrders.delete(val); // Remove oldest
                    }

                    const customerName = order.customers?.name || "Customer";
                    const locationDesc = order.order_type === 'dine-in' 
                        ? `Table ${order.table_number || "unknown"}` 
                        : (order.order_type || "Takeout");
                        
                    const itemsDesc = order.items.map((i: any) => `${i.quantity} ${i.name}`).join(", ");
                    const announcement = `New order for ${customerName}, ${locationDesc}. ${itemsDesc}.`;
                    
                    const utterance = new SpeechSynthesisUtterance(announcement);
                    utterance.rate = 0.9; // Slightly slower for readability
                    utterance.pitch = 1.0; 
                    
                    // Phase 5: The Failsafe Queue
                    utterance.onerror = (event) => {
                        console.error("TTS Error:", event);
                        // Filter for actual blocks / backgrounding closures
                        const fatalErrors = ["not-allowed", "audio-busy", "network", "synthesis-failed"];
                        if (fatalErrors.includes(event.error) || (typeof document !== "undefined" && document.hidden)) {
                            setMissedAudioQueue(prev => [...prev, announcement]);
                        }
                    };
                    
                    window.speechSynthesis.speak(utterance);
                });
            }

            setOrders(ordersData as any);
        }
    }, [skipOrders]);

    // Initial fetch + polling + realtime subscription
    useEffect(() => {
        // Phase 4: State Release & Listener Initialization
        // Do not fetch data or open WebSockets until the shift is explicitly started
        if (!isShiftActive) {
            setRealtimeStatus('CLOSED');
            return;
        }

        setRealtimeStatus('CONNECTING');

        // Fetch store status
        const fetchStatus = async () => {
            const { getStoreStatus } = await import("@/app/actions/storeStatus");
            const status = await getStoreStatus();
            setStoreStatus(status);
        };

        // Fetch customers
        const fetchCustomers = async () => {
            if (skipCustomers) return;
            const res = await getSecureKitchenCustomers();
            if (res.success && res.data) {
                setCustomers(res.data);
            }
        };

        fetchStatus();
        if (!skipOrders) {
            fetchOrders();
        }
        if (!skipCustomers) {
            fetchCustomers();
        }

        // Self-Healing Dynamic Polling:
        // Normal state polls every 15s. If realtime channel drops, poll every 3s.
        let pollTimer: NodeJS.Timeout;
        const startPolling = (intervalMs: number) => {
            if (pollTimer) clearInterval(pollTimer);
            pollTimer = setInterval(() => {
                console.log(`Fallback Polling data at ${intervalMs}ms interval...`);
                if (!skipOrders) fetchOrders();
                fetchStatus();
            }, intervalMs);
        };

        // Initialize standard polling
        startPolling(POLL_INTERVAL);

        // If skipRealtime is active or skipOrders is active, we don't open websocket channel
        if (skipOrders || skipRealtime) {
            setRealtimeStatus('CLOSED');
            return () => {
                if (pollTimer) clearInterval(pollTimer);
            };
        }

        // Standard Static Channel Name to prevent connection leaks and scale easily
        const channelName = "kitchen_dashboard_orders";
        const channel = supabase
            .channel(channelName)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
                console.log("⚡ Realtime INSERT received — fetching immediately");
                fetchOrders();
            })
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => {
                console.log("⚡ Realtime UPDATE received — fetching immediately");
                fetchOrders();
            })
            .subscribe((status, err) => {
                console.log(`📡 Realtime status transitioned to: ${status}`, err || "");
                if (status === "SUBSCRIBED") {
                    setRealtimeStatus('SUBSCRIBED');
                    startPolling(POLL_INTERVAL); // Reset back to standard polling
                } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                    setRealtimeStatus('CHANNEL_ERROR');
                    startPolling(3000); // Scale down to high-speed backup polling (3 seconds)
                } else if (status === "CLOSED") {
                    setRealtimeStatus('CLOSED');
                }
            });

        return () => {
            if (pollTimer) clearInterval(pollTimer);
            supabase.removeChannel(channel);
        };
    }, [fetchOrders, isShiftActive, skipOrders, skipCustomers, skipRealtime]);

    const handleStatusUpdate = async (id: string, status: string) => {
        const originalOrders = [...orders];
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        
        try {
            const res = await updateOrderStatus(id, status);
            if (!res || !res.success) {
                throw new Error("Action failed");
            }
        } catch (error) {
            console.error("Failed to update order status:", error);
            // Rollback optimistic update
            setOrders(originalOrders);
            alert("Database Error: Failed to update order status. The database is currently unreachable.");
        }
    };

    const handleToggleStore = async () => {
        if (!storeStatus) return;
        const { toggleStoreStatus, getStoreStatus } = await import("@/app/actions/storeStatus");

        const originalStatus = { ...storeStatus };
        const newStatus = !storeStatus.isOpen;
        
        // Optimistic state update
        setStoreStatus(prev => prev ? { ...prev, isOpen: newStatus, isManual: true } : null);

        try {
            const res = await toggleStoreStatus(newStatus ? "OPEN" : "CLOSED");
            if (!res || !res.success) {
                throw new Error("Action failed");
            }
            const updated = await getStoreStatus();
            setStoreStatus(updated);
        } catch (error) {
            console.error("Failed to toggle store status:", error);
            // Rollback optimistic state
            setStoreStatus(originalStatus);
            alert("Database Error: Failed to toggle store status. The server or database is currently unreachable.");
        }
    };

    return {
        orders,
        customers,
        storeStatus,
        isShiftActive,
        realtimeStatus,
        missedAudioQueue,
        startShift,
        playMissedAudio,
        handleStatusUpdate,
        handleToggleStore
    };
}
