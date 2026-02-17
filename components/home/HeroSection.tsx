"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Heart } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-gray-900 flex items-center justify-center">
            {/* Background Image with Slow Zoom */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-black/50 to-black/30 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=2032&auto=format&fit=crop"
                    alt="Big-Belly Cheesy Pasta"
                    className="w-full h-full object-cover opacity-90"
                />
            </motion.div>

            {/* Content */}
            <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="font-heading font-extrabold text-5xl md:text-7xl text-white mb-4 drop-shadow-xl"
                >
                    Cheesy. Spicy. <br />
                    <span className="text-cheese">Ready in 15 mins.</span>
                </motion.h1>

                {/* Floating Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -top-12 -right-4 md:-right-12 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl rotate-12 animate-float hidden md:block" // Hidden on small screens to avoid overflow
                >
                    <div className="text-center">
                        <p className="text-cheese font-bold text-xl">15% OFF</p>
                        <p className="text-white text-xs uppercase tracking-wider">Student Discount</p>
                        <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-2 animate-pulse" />
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
                    className="bg-metro text-white font-bold text-xl px-8 py-4 rounded-full shadow-[0_4px_14px_0_rgba(230,33,41,0.39)] hover:shadow-[0_6px_20px_rgba(230,33,41,0.23)] hover:bg-red-600 transition-all mt-8 mb-8"
                >
                    Check Menu
                </motion.button>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-6 md:gap-8 text-white/90"
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-green-400" size={20} />
                        <span className="font-bold text-sm md:text-base">Halal Certified</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-cheese" size={20} />
                        <span className="font-bold text-sm md:text-base">100% Fresh</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart className="text-metro" size={20} />
                        <span className="font-bold text-sm md:text-base">Student Friendly</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
