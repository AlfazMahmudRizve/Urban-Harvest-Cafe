"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { updateOrderStatus } from "@/app/actions/updateOrder";

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

const POLL_INTERVAL = 5000; // Poll every 5 seconds as fallback

export function useDashboardData() {
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
    const lastOrderCountRef = useRef<number>(0);
    const isFirstLoadRef = useRef(true);

    // Initialize speech synthesis and prime it on first user interaction
    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        
        // Browser blocks audio/speech unless triggered by user gesture.
        // Prime the speech engine on first click.
        const primeSpeech = () => {
            const utterance = new SpeechSynthesisUtterance("");
            utterance.volume = 0;
            window.speechSynthesis.speak(utterance);
            console.log("🔊 TTS primed — dashboard will speak new orders");
            document.removeEventListener("click", primeSpeech);
        };
        document.addEventListener("click", primeSpeech);

        return () => document.removeEventListener("click", primeSpeech);
    }, []);

    // Fetch all data
    const fetchOrders = useCallback(async () => {
        const { data: ordersData } = await supabase
            .from("orders")
            .select("*, customers(name, phone, visit_count, total_spend)")
            .order("created_at", { ascending: false });

        if (ordersData) {
            const newCount = ordersData.length;
            const prevCount = lastOrderCountRef.current;

            // Play TTS if new orders appeared (not on first load)
            if (!isFirstLoadRef.current && newCount > prevCount) {
                const diff = newCount - prevCount;
                console.log(`🔔 New order detected! (${prevCount} → ${newCount})`);
                
                // Get the newest orders (since it's sorted by created_at DESC)
                const newOrdersList = ordersData.slice(0, diff);
                
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    newOrdersList.forEach((order: any) => {
                        const customerName = order.customers?.name || "Customer";
                        const locationDesc = order.order_type === 'dine-in' 
                            ? `Table ${order.table_number || "unknown"}` 
                            : (order.order_type || "Takeout");
                            
                        const itemsDesc = order.items.map((i: any) => `${i.quantity} ${i.name}`).join(", ");
                        
                        const announcement = `New order for ${customerName}, ${locationDesc}. ${itemsDesc}.`;
                        
                        // Prevent overlap or spam by cancelling current speech if needed
                        // window.speechSynthesis.cancel();
                        
                        const utterance = new SpeechSynthesisUtterance(announcement);
                        utterance.rate = 0.9; // Slightly slower for readability
                        utterance.pitch = 1.0; 
                        window.speechSynthesis.speak(utterance);
                    });
                }
            }

            lastOrderCountRef.current = newCount;
            isFirstLoadRef.current = false;
            setOrders(ordersData as any);
        }
    }, []);

    // Initial fetch + polling
    useEffect(() => {
        // Fetch store status
        const fetchStatus = async () => {
            const { getStoreStatus } = await import("@/app/actions/storeStatus");
            const status = await getStoreStatus();
            setStoreStatus(status);
        };

        // Fetch customers
        const fetchCustomers = async () => {
            const { data: customersData } = await supabase
                .from("customers")
                .select("*")
                .order("total_spend", { ascending: false })
                .limit(50);
            if (customersData) setCustomers(customersData);
        };

        fetchStatus();
        fetchOrders();
        fetchCustomers();

        // Polling fallback + status refresher
        const pollInterval = setInterval(() => {
            fetchOrders();
            fetchStatus(); // Also poll load capacity metrics for the UI
        }, POLL_INTERVAL);

        // Also try Realtime for instant updates (best-effort)
        const channelName = `dashboard_${Date.now()}`;
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
            .subscribe((status) => {
                console.log("📡 Realtime status:", status);
            });

        return () => {
            clearInterval(pollInterval);
            supabase.removeChannel(channel);
        };
    }, [fetchOrders]);

    const handleStatusUpdate = async (id: string, status: string) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        await updateOrderStatus(id, status);
    };

    const handleToggleStore = async () => {
        if (!storeStatus) return;
        const { toggleStoreStatus, getStoreStatus } = await import("@/app/actions/storeStatus");

        const newStatus = !storeStatus.isOpen;
        setStoreStatus(prev => prev ? { ...prev, isOpen: newStatus, isManual: true } : null);

        await toggleStoreStatus(newStatus ? "OPEN" : "CLOSED");
        const updated = await getStoreStatus();
        setStoreStatus(updated);
    };

    return {
        orders,
        customers,
        storeStatus,
        handleStatusUpdate,
        handleToggleStore
    };
}
