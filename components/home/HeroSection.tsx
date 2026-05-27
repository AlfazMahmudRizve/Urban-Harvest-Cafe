"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Heart, User, ChevronDown } from "lucide-react";
import { getStoreStatus } from "@/app/actions/storeStatus";

export default function HeroSection() {
    const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean } | null>(null);

    useEffect(() => {
        getStoreStatus().then(setStoreStatus);
    }, []);

    const handleScrollDown = () => {
        const menuSection = document.getElementById("menu-start");
        if (menuSection) {
            menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            console.error("Menu start section not found!");
        }
    };

    return (
        <section className="relative w-full h-[90vh] md:h-[95vh] overflow-hidden bg-espresso flex items-center justify-center grain-overlay">
            {/* Background Image with Slow Zoom */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1 }}
                animate={{ scale: 1.06 }}
                transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/70 to-espresso/25 z-10" />
                {/* Warm overlay for richness */}
                <div className="absolute inset-0 bg-gradient-to-br from-espresso-deep/40 via-transparent to-latte/15 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=2000&auto=format&fit=crop"
                    alt="Artisan Brunch Spread"
                    className="w-full h-full object-cover opacity-90"
                />
            </motion.div>

            {/* Top Control Bar (Status & Profile) */}
            <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
                {storeStatus && (
                    <div className={`glass-card flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs bg-white/95 shadow-sm border border-latte/15 ${storeStatus.isOpen
                        ? "text-sage"
                        : "text-red-600"
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? "bg-sage animate-pulse" : "bg-red-600"}`} />
                        {storeStatus.isOpen ? "OPEN" : "CLOSED"}
                    </div>
                )}

                <a href="/profile" className="glass-card flex items-center gap-2 text-espresso hover:text-sage bg-white/95 border border-latte/20 px-4 py-2 rounded-full font-bold text-sm hover:bg-cream-warm transition-all font-sans cursor-pointer shadow-sm">
                    <User size={16} /> My Profile
                </a>
            </div>

            <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="font-heading font-bold text-5xl md:text-7xl lg:text-8xl text-cream mb-4 drop-shadow-2xl leading-tight"
                >
                    Artisan. <span className="italic">Fresh.</span> <br />
                    <span className="text-gradient-warm">Served with Love.</span>
                </motion.h1>

                {/* Floating Promo Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute -top-12 -right-4 md:-right-12 lg:-right-16 glass-card p-5 rounded-2xl shadow-aromatic-xl rotate-6 animate-float hidden md:block"
                >
                    <div className="text-center">
                        <p className="text-espresso font-heading font-bold text-2xl">15% OFF</p>
                        <p className="text-sage text-xs uppercase tracking-wider font-bold mt-1">Students & Locals</p>
                        <div className="w-2 h-2 bg-sage rounded-full mx-auto mt-2 animate-pulse-glow" />
                    </div>
                </motion.div>

                {/* Explore Button */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleScrollDown}
                    className="btn-glow bg-sage text-cream font-bold text-xl px-12 py-5 rounded-full shadow-glow-sage hover:bg-sage/90 transition-all mt-8 mb-8 font-heading tracking-wide relative overflow-hidden cursor-pointer"
                >
                    <span className="relative z-10">Explore the Menu</span>
                    <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', backgroundSize: '200% 100%' }} />
                </motion.button>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex flex-wrap justify-center gap-4 text-espresso font-sans"
                >
                    <div className="bg-white/95 backdrop-blur-sm border border-latte/25 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                        <ShieldCheck className="text-sage" size={18} />
                        <span className="font-bold text-sm">Organic Ingredients</span>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm border border-latte/25 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                        <CheckCircle2 className="text-latte" size={18} />
                        <span className="font-bold text-sm">Freshly Baked</span>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm border border-latte/25 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                        <Heart className="text-sage" size={18} />
                        <span className="font-bold text-sm">Community First</span>
                    </div>
                </motion.div>
            </div>

            {/* Bouncing Scroll Down Cue */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 cursor-pointer"
                onClick={handleScrollDown}
            >
                <span className="text-[10px] text-cream/60 font-black uppercase tracking-widest font-sans">Scroll Down</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown className="text-cream" size={24} />
                </motion.div>
            </motion.div>
        </section>
    );
}
