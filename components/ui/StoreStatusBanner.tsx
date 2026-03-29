"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function StoreStatusBanner() {
    const [status, setStatus] = useState<{ isOpen: boolean; message: string; isManual: boolean } | null>(null);

    const fetchStatus = async () => {
        const { getStoreStatus } = await import("@/app/actions/storeStatus");
        const data = await getStoreStatus();
        setStatus(data);
    };

    useEffect(() => {
        fetchStatus();

        const channel = supabase
            .channel("store_status_sync")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "store_settings", filter: "id=eq.1" },
                () => {
                    fetchStatus();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <AnimatePresence>
            {status && !status.isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-red-600 text-white font-bold sticky top-0 z-[60] shadow-md overflow-hidden"
                >
                    <div className="py-3 px-4 text-center flex items-center justify-center gap-2">
                        <Clock size={20} className="animate-pulse" />
                        <span>{status.message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
