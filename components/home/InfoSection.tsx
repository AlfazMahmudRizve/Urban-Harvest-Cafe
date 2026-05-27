"use client";

import { Clock, MapPin, Truck, Utensils, ShoppingBag, Phone, Mail } from "lucide-react";
import { getFormattedHours, SERVICES } from "@/lib/utils/businessHours";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function InfoSection() {
    const hours = getFormattedHours();
    const [status, setStatus] = useState<{ isOpen: boolean, message: string } | null>(null);

    const fetchStatus = async () => {
        const { getStoreStatus } = await import("@/app/actions/storeStatus");
        const data = await getStoreStatus();
        setStatus(data);
    };

    useEffect(() => {
        fetchStatus();

        const channel = supabase
            .channel("info_section_status_sync")
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

    const serviceIcons: Record<string, React.ReactNode> = {
        "Delivery": <Truck size={20} className="text-sage" />,
        "Takeout": <ShoppingBag size={20} className="text-sage" />,
        "Dine-in": <Utensils size={20} className="text-sage" />,
        "In-store pickup": <MapPin size={20} className="text-sage" />,
    };

    return (
        <section className="py-16 bg-cream-warm">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start max-w-5xl mx-auto">

                    {/* Hours Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="divider-flourish mb-6">
                            <h2 className="font-heading font-bold text-3xl text-espresso px-4 flex items-center gap-3">
                                <Clock className="text-espresso" size={28} />
                                Cafe Hours
                            </h2>
                        </div>

                        <div className="card-premium shadow-inner-warm p-6">
                            {/* Status Badge */}
                            <div className={`mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm backdrop-blur-sm border transition-colors duration-300 ${status?.isOpen ? "bg-sage/10 border-sage/20 text-sage" : "bg-red-100 border-red-200 text-red-700"
                                }`}>
                                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${status?.isOpen ? "bg-sage animate-pulse" : "bg-red-600"}`} />
                                {status?.message}
                            </div>

                            <ul className="space-y-3">
                                {hours.map((h, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: i * 0.08 }}
                                        className="flex justify-between items-center text-espresso/80 border-b border-latte/10 pb-2 last:border-0 last:pb-0 font-sans"
                                    >
                                        <span className="font-bold">{h.day}</span>
                                        <span className="font-bold text-sm">{h.time}</span>
                                    </motion.li>
                                ))}
                            </ul>
                            <p className="text-xs text-espresso/40 mt-4 text-center">Timezone: Asia/Dhaka (GMT+6)</p>
                        </div>
                    </motion.div>

                    {/* Services Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="divider-flourish mb-6">
                            <h2 className="font-heading font-bold text-3xl text-espresso px-4 flex items-center gap-3">
                                <Utensils className="text-latte" size={28} />
                                Services
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {SERVICES.map((service, i) => (
                                <motion.div
                                    key={service}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.35, delay: i * 0.08 }}
                                    className="card-premium hover-lift flex items-center gap-3 p-4 group cursor-pointer"
                                >
                                    <div className="p-2 bg-sage/10 text-sage rounded-xl group-hover:bg-sage/20 transition-colors duration-200">
                                        {serviceIcons[service]}
                                    </div>
                                    <span className="font-bold text-espresso">{service}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Contact Column */}
                    <motion.div
                        className="md:col-span-2 mt-8 border-t border-latte/20 pt-8"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                            <div className="flex flex-col items-center md:items-start">
                                <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mb-3">
                                    <MapPin className="text-sage" size={22} />
                                </div>
                                <h3 className="font-bold text-espresso">Visit Us</h3>
                                <p className="text-espresso/70 text-sm mt-1 font-sans">
                                    House 123, Road 4, Block B<br />
                                    Banani, Dhaka, Bangladesh
                                </p>
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mb-3">
                                    <Phone className="text-sage" size={22} />
                                </div>
                                <h3 className="font-bold text-espresso">Call Us</h3>
                                <p className="text-espresso/70 text-sm mt-1 font-sans">
                                    <a href="tel:+8801234567890" className="hover:text-sage transition-colors duration-200 cursor-pointer">+880 1234-567890</a>
                                </p>
                            </div>
                            <div className="flex flex-col items-center md:items-start">
                                <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center mb-3">
                                    <Mail className="text-sage" size={22} />
                                </div>
                                <h3 className="font-bold text-espresso">Email Us</h3>
                                <p className="text-espresso/70 text-sm mt-1 font-sans">
                                    <a href="mailto:urbanharvest.cafe@gmail.com" className="hover:text-sage transition-colors duration-200 cursor-pointer">urbanharvest.cafe@gmail.com</a>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
