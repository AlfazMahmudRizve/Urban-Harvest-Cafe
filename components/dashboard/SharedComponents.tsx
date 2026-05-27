"use client";

import { AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

export function MetricCard({ title, value, icon, color, trend }: any) {
    return (
        <div className={`card-dash p-6 border-l-4 ${color} flex items-center justify-between`}>
            <div>
                <p className="text-latte/50 font-bold text-sm uppercase tracking-wider">{title}</p>
                <div className="text-4xl font-extrabold font-heading mt-1 text-cream">{value}</div>
                <p className="text-xs font-medium text-latte/40 mt-2">{trend}</p>
            </div>
            <div className="bg-dash-surface-hover rounded-2xl p-4">
                {icon}
            </div>
        </div>
    );
}

export function Column({ title, count, color, headerColor, icon, children, maxHeight }: any) {
    return (
        <div className={`flex flex-col overflow-hidden h-full card-dash`}>
            <div className={`p-4 font-bold flex justify-between items-center ${headerColor}`}>
                <div className="flex items-center gap-2 uppercase tracking-widest text-sm">
                    {icon}
                    {title}
                </div>
                <span className="bg-white/10 text-white px-2 py-1 rounded text-xs font-bold">{count}</span>
            </div>
            <div className={`bg-dash-bg/50 flex-1 overflow-y-auto p-4 space-y-3 dash-scrollbar ${maxHeight || ''}`}>
                <AnimatePresence mode="popLayout">
                    {children}
                </AnimatePresence>
            </div>
        </div>
    );
}
