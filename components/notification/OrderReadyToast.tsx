"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrderReadyToast({ customerId }: { customerId?: string }) {
    const [notification, setNotification] = useState<{ id: string, table?: string } | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastCompletedRef = useRef<Set<string>>(new Set());
    const isFirstLoadRef = useRef(true);
    const router = useRouter();

    // Initialize audio once
    useEffect(() => {
        if (typeof Audio !== "undefined") {
            audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        }
    }, []);

    // Poll for order status changes
    useEffect(() => {
        if (!customerId) return;

        const checkForCompletedOrders = async () => {
            const { data } = await supabase
                .from("orders")
                .select("id, status, table_number")
                .eq("customer_id", customerId)
                .eq("status", "completed")
                .order("created_at", { ascending: false })
                .limit(5);

            if (!data) return;

            // On first load, just record the existing completed orders
            if (isFirstLoadRef.current) {
                data.forEach(o => lastCompletedRef.current.add(o.id));
                isFirstLoadRef.current = false;
                return;
            }

            // Check for newly completed orders
            for (const order of data) {
                if (!lastCompletedRef.current.has(order.id)) {
                    lastCompletedRef.current.add(order.id);
                    console.log("🔔 Order completed!", order.id);

                    setNotification({
                        id: order.id,
                        table: order.table_number
                    });

                    if (audioRef.current) {
                        try {
                            audioRef.current.currentTime = 0;
                            await audioRef.current.play();
                        } catch (e) {
                            console.log("Audio blocked:", e);
                        }
                    }
                    break; // Show one notification at a time
                }
            }
        };

        checkForCompletedOrders();
        const pollInterval = setInterval(checkForCompletedOrders, 5000);

        return () => clearInterval(pollInterval);
    }, [customerId]);

    if (!notification) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[10000] max-w-sm w-full"
            >
                <div className="bg-espresso text-cream p-5 rounded-2xl shadow-2xl border-2 border-latte flex items-start gap-4 relative overflow-hidden">
                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 blur-2xl rounded-full -mr-10 -mt-10" />

                    <div className="bg-green-500 p-3 rounded-full text-white animate-bounce">
                        <ChefHat size={24} />
                    </div>

                    <div className="flex-1">
                        <h4 className="font-heading font-bold text-lg leading-tight mb-1">Order Ready! 🍽️</h4>
                        <p className="text-sm text-cream/80 font-sans mb-3">
                            {notification.table
                                ? `Your food for Table ${notification.table} is coming now!`
                                : "Your takeout/delivery order is ready!"}
                        </p>
                        <button
                            onClick={() => {
                                setNotification(null);
                                router.push(`/success?id=${notification.id}`);
                            }}
                            className="text-xs font-bold bg-cream text-espresso px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                        >
                            View Receipt
                        </button>
                    </div>

                    <button
                        onClick={() => setNotification(null)}
                        className="text-cream/50 hover:text-cream transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
