"use client";

import { motion } from "framer-motion";
import { Plus, Flame, Star } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { cn } from "@/lib/utils";

interface MenuCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    tags: string[];
}

export default function MenuCard({ id, name, price, image, tags }: MenuCardProps) {
    const addToCart = useCartStore((state) => state.addToCart);

    const handleAdd = () => {
        addToCart({ id, name, price, image });
    };

    return (
        <motion.div
            className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3 }}
        >
            {/* Image Section */}
            <div className="h-48 overflow-hidden relative">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Tags */}
                <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
                    {tags.includes("spicy") && (
                        <span className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md font-sans">
                            <Flame size={12} fill="currentColor" /> Spicy
                        </span>
                    )}
                    {tags.includes("bestseller") && (
                        <span className="flex items-center gap-1 bg-white border-2 border-latte text-espresso px-2 py-1 rounded-full text-xs font-bold shadow-sm font-sans">
                            <Star size={12} className="text-latte" fill="currentColor" /> Best Seller
                        </span>
                    )}
                    {tags.includes("fresh") && (
                        <span className="flex items-center gap-1 bg-sage text-white px-2 py-1 rounded-full text-xs font-bold shadow-md font-sans">
                            Fresh
                        </span>
                    )}
                    {tags.includes("healthy") && (
                        <span className="flex items-center gap-1 bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded-full text-xs font-bold shadow-sm font-sans">
                            Healthy
                        </span>
                    )}
                    {tags.includes("sweet") && (
                        <span className="flex items-center gap-1 bg-pink-100 text-pink-800 border border-pink-200 px-2 py-1 rounded-full text-xs font-bold shadow-sm font-sans">
                            Sweet
                        </span>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <h3 className="font-heading font-bold text-xl leading-tight text-espresso group-hover:text-sage transition-colors duration-300">
                        {name}
                    </h3>
                    <span className="font-sans font-bold text-lg text-espresso/80">
                        ৳{price}
                    </span>
                </div>

                {/* Add Button */}
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAdd();
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-espresso text-cream font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:bg-espresso/90 shadow-md hover:shadow-lg mt-auto font-sans"
                >
                    <Plus size={18} />
                    Add to Tray
                </motion.button>
            </div>
        </motion.div>
    );
}
