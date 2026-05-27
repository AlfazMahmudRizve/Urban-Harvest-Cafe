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
        <section className="relative w-full h-[42vh] md:h-[48vh] overflow-hidden bg-espresso flex items-center justify-center grain-overlay">
            {/* Background Image with Slow Zoom */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1 }}
                animate={{ scale: 1.06 }}
                transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/70 to-espresso/20 z-10" />
                {/* Warm overlay for richness */}
                <div className="absolute inset-0 bg-gradient-to-br from-espresso-deep/30 via-transparent to-latte/10 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=2000&auto=format&fit=crop"
                    alt="Artisan Brunch Spread"
                    className="w-full h-full object-cover opacity-90"
                />
            </motion.div>

            {/* Content */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                {/* Store Status Indicator (Mobile fallback, or small visual reference) */}
                {storeStatus && (
                    <div className={`lg:hidden glass-card-dark flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs ${storeStatus.isOpen
                        ? "text-green-300"
                        : "text-red-300"
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                        {storeStatus.isOpen ? "OPEN" : "CLOSED"}
                    </div>
                )}

                <a href="/profile" className="lg:hidden glass-card-dark flex items-center gap-2 text-cream px-4 py-2 rounded-full font-bold text-sm hover:bg-white/20 transition-all font-sans cursor-pointer">
                    <User size={18} /> My Profile
                </a>
            </div>

            <div className="relative z-20 text-center px-6 max-w-3xl mx-auto flex flex-col items-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-cream mb-3 drop-shadow-2xl leading-tight"
                >
                    Artisan. <span className="italic">Fresh.</span> <br />
                    <span className="text-gradient-warm">Served with Love.</span>
                </motion.h1>

                {/* Floating Badge - optimized position */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute -top-6 -right-2 lg:-right-4 glass-card p-4 rounded-2xl shadow-aromatic-xl rotate-6 animate-float hidden md:block"
                >
                    <div className="text-center">
                        <p className="text-espresso font-heading font-bold text-xl">15% OFF</p>
                        <p className="text-sage text-[9px] uppercase tracking-wider font-bold mt-0.5">Students & Locals</p>
                        <div className="w-1.5 h-1.5 bg-sage rounded-full mx-auto mt-1.5 animate-pulse-glow" />
                    </div>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                        const menuSection = document.getElementById("menu-start");
                        if (menuSection) {
                            menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
                        } else {
                            console.error("Menu section not found!");
                        }
                    }}
                    className="btn-glow bg-sage text-cream font-bold text-xl px-10 py-4 rounded-full shadow-glow-sage hover:bg-sage/90 transition-all mt-6 mb-6 font-heading tracking-wide relative overflow-hidden cursor-pointer"
                >
                    <span className="relative z-10">View Menu</span>
                    <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', backgroundSize: '200% 100%' }} />
                </motion.button>

                {/* Trust Badges - compacted */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-3 md:gap-4 text-cream/90 font-sans"
                >
                    <div className="glass-card rounded-full px-3.5 py-1.5 flex items-center gap-2">
                        <ShieldCheck className="text-sage" size={16} />
                        <span className="font-medium text-xs">Organic Ingredients</span>
                    </div>
                    <div className="glass-card rounded-full px-3.5 py-1.5 flex items-center gap-2">
                        <CheckCircle2 className="text-latte" size={16} />
                        <span className="font-medium text-xs">Freshly Baked</span>
                    </div>
                    <div className="glass-card rounded-full px-3.5 py-1.5 flex items-center gap-2">
                        <Heart className="text-sage" size={16} />
                        <span className="font-medium text-xs">Community First</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
