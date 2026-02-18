"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Heart, User } from "lucide-react";
import { getStoreStatus } from "@/app/actions/storeStatus";

export default function HeroSection() {
    const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean } | null>(null);

    useEffect(() => {
        getStoreStatus().then(setStoreStatus);
    }, []);
    return (
        <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-espresso flex items-center justify-center">
            {/* Background Image with Slow Zoom */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/60 to-black/20 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=2000&auto=format&fit=crop"
                    alt="Artisan Brunch Spread"
                    className="w-full h-full object-cover opacity-90"
                />
            </motion.div>

            {/* Content */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                {/* Store Status Indicator */}
                {storeStatus && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs backdrop-blur-md border shadow-sm ${storeStatus.isOpen
                        ? "bg-green-500/10 border-green-400 text-green-100"
                        : "bg-red-500/10 border-red-400 text-red-100"
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                        {storeStatus.isOpen ? "OPEN" : "CLOSED"}
                    </div>
                )}

                <a href="/profile" className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-cream px-4 py-2 rounded-full font-bold text-sm hover:bg-white/20 transition-all font-sans">
                    <User size={18} /> My Profile
                </a>
            </div>

            <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="font-heading font-bold text-5xl md:text-7xl text-cream mb-4 drop-shadow-xl"
                >
                    Artisan. <span className="italic">Fresh.</span> <br />
                    <span className="text-latte">Served with Love.</span>
                </motion.h1>

                {/* Floating Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -top-12 -right-4 md:-right-12 bg-cream/90 backdrop-blur-md border border-latte/50 p-4 rounded-2xl shadow-xl rotate-6 animate-float hidden md:block" // Hidden on small screens to avoid overflow
                >
                    <div className="text-center">
                        <p className="text-espresso font-heading font-bold text-xl">15% OFF</p>
                        <p className="text-sage text-xs uppercase tracking-wider font-bold">Students & Locals</p>
                        <div className="w-2 h-2 bg-sage rounded-full mx-auto mt-2 animate-pulse" />
                    </div>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        const menuSection = document.getElementById("menu-start");
                        if (menuSection) {
                            menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
                        } else {
                            console.error("Menu section not found!");
                        }
                    }}
                    className="bg-sage text-white font-bold text-xl px-10 py-4 rounded-full shadow-lg hover:bg-sage/90 transition-all mt-8 mb-8 font-heading tracking-wide"
                >
                    View Menu
                </motion.button>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-6 md:gap-8 text-cream/90 font-sans"
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-sage" size={20} />
                        <span className="font-medium text-sm md:text-base">Organic Ingredients</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-latte" size={20} />
                        <span className="font-medium text-sm md:text-base">Freshly Baked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart className="text-sage" size={20} />
                        <span className="font-medium text-sm md:text-base">Community First</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
