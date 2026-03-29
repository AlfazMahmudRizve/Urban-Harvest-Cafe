"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function LoyaltyBanner() {
    return (
        <section className="w-full bg-gradient-to-r from-espresso via-[#5D4E44] to-sage py-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />

            <div className="container mx-auto px-4 relative z-10 flex items-center justify-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-cream/10 backdrop-blur-md border border-cream/10 rounded-2xl p-6 md:p-8 max-w-4xl shadow-xl"
                >
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <div className="flex-shrink-0 bg-cream text-espresso p-4 rounded-full shadow-lg">
                            <Sparkles size={32} />
                        </div>
                        <div className="text-cream space-y-2">
                            <h3 className="font-heading font-bold text-2xl md:text-3xl leading-tight text-latte">
                                Sip. Savor. <span className="text-white">Save. ☕</span>
                            </h3>
                            <p className="font-sans font-medium text-lg md:text-xl opacity-95">
                                Visit us <span className="font-bold text-latte">5 times</span> & enjoy <span className="font-bold text-latte">20% OFF</span> your future cravings.
                            </p>
                            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mt-2 text-sage">
                                Join the Coffee Club Today
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
