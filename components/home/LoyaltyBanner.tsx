"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function LoyaltyBanner() {
    return (
        <section className="w-full bg-gradient-to-r from-espresso-deep via-espresso to-sage-deep py-8 overflow-hidden relative grain-overlay">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />

            {/* Shimmer line */}
            <div className="absolute inset-x-0 top-1/2 h-px animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', backgroundSize: '200% 100%' }} />

            <div className="container mx-auto px-4 relative z-10 flex items-center justify-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white/95 backdrop-blur-md border border-latte/15 rounded-3xl p-6 md:p-8 max-w-4xl shadow-xl"
                >
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-left">
                        <div className="flex-shrink-0 bg-sage/10 text-sage p-4 rounded-full border border-sage/25 shadow-sm">
                            <Sparkles size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-heading font-black text-3xl md:text-4xl leading-tight text-espresso">
                                Sip. Savor. <span className="text-sage">Save.</span>
                            </h3>
                            <p className="font-sans font-medium text-lg md:text-xl text-espresso/85">
                                Visit us <span className="font-black text-sage">5 times</span> & enjoy <span className="font-black text-sage">20% OFF</span> your future cravings.
                            </p>
                            <p className="text-xs font-black uppercase tracking-widest text-espresso/50 pt-1">
                                Join the Coffee Club Today
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
