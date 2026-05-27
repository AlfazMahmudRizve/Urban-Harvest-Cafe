"use client";

import { usePathname } from "next/navigation";
import { LayoutGrid, Utensils, Store, TrendingUp, ChefHat, Users, QrCode, Settings2 } from "lucide-react";
import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardHeader() {
    const pathname = usePathname();
    const { storeStatus, handleToggleStore } = useDashboardData({ skipOrders: true, skipCustomers: true, skipRealtime: true });

    // Helper to check active state
    const isActive = (path: string) => pathname.includes(path);

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-card p-4 rounded-2xl border border-latte/15 sticky top-4 z-50 mb-8">
            <div className="flex flex-col gap-1">
                <Link href="/dashboard/kitchen" className="flex items-center gap-2 group cursor-pointer">
                    <div className="bg-sage/10 text-sage p-1.5 rounded-lg border border-sage/20 transition-transform group-hover:scale-105 duration-200">
                        <Store size={20} />
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-espresso tracking-tight transition-colors group-hover:text-sage">Urban Harvest Hub</h1>
                </Link>
                <div className="flex items-center gap-2 text-xs font-semibold text-espresso/45 tracking-wider uppercase ml-[38px]">
                    <span>Kitchen Feed Active</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Navigation Buttons */}
                <div className="flex items-center gap-1 mr-4 bg-cream-warm/75 p-1 rounded-xl border border-latte/12">
                    <Link
                        href="/dashboard/analytics"
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer ${isActive('analytics')
                                ? "bg-white text-emerald-600 border border-emerald-600/20 shadow-sm"
                                : "text-espresso/50 hover:text-espresso hover:bg-white/80"
                            }`}
                    >
                        <TrendingUp size={14} /> Analytics
                    </Link>
                    <Link
                        href="/dashboard/kitchen"
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer ${isActive('kitchen')
                                ? "bg-white text-orange-700 border border-orange-600/20 shadow-sm"
                                : "text-espresso/50 hover:text-espresso hover:bg-white/80"
                            }`}
                    >
                        <ChefHat size={14} /> Kitchen
                    </Link>
                    <Link
                        href="/dashboard/customers"
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer ${isActive('customers')
                                ? "bg-white text-purple-700 border border-purple-600/20 shadow-sm"
                                : "text-espresso/50 hover:text-espresso hover:bg-white/80"
                            }`}
                    >
                        <Users size={14} /> Customers
                    </Link>
                    <Link
                        href="/dashboard/qr"
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer ${isActive('qr')
                                ? "bg-white text-blue-700 border border-blue-600/20 shadow-sm"
                                : "text-espresso/50 hover:text-espresso hover:bg-white/80"
                            }`}
                    >
                        <QrCode size={14} /> QR Codes
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 cursor-pointer ${isActive('settings')
                                ? "bg-white text-espresso border border-latte/20 shadow-sm"
                                : "text-espresso/50 hover:text-espresso hover:bg-white/80"
                            }`}
                    >
                        <Settings2 size={14} /> Settings
                    </Link>
                </div>

                {storeStatus && (
                    <div className="flex items-center gap-2">
                        {/* Active Load capacity indicator */}
                        <div className="hidden lg:flex items-center gap-2 bg-cream-warm/75 border border-latte/12 rounded-xl px-3 py-1.5 text-espresso/60">
                            <span className="text-xs font-bold">Wait: <span className="text-espresso">{storeStatus.estimatedPrepTime}m</span></span>
                            <span className="w-1 h-1 bg-espresso/10 rounded-full" />
                            <span className="text-xs font-bold">Load: <span className={storeStatus.activeOrders && storeStatus.activeOrders > 10 ? "text-red-600" : "text-orange-600"}>{storeStatus.activeOrders}</span></span>
                        </div>

                        <button
                            onClick={handleToggleStore}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors duration-200 border cursor-pointer active:scale-95 ${storeStatus.isOpen
                                ? "bg-sage/10 text-sage border-sage/20 hover:bg-sage/20"
                                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? "bg-sage animate-pulse" : "bg-red-500"}`} />
                            {storeStatus.isOpen ? "OPEN" : "CLOSED"}
                            {storeStatus.isManual && (
                                <span className="text-[9px] bg-espresso/5 px-1 py-0.5 rounded ml-1 border border-espresso/10 opacity-70">
                                    M
                                </span>
                            )}
                        </button>
                    </div>
                )}

                <a
                    href="/dashboard/menu"
                    className="bg-cream-warm/50 text-espresso hover:bg-cream-warm font-bold px-3 py-1.5 rounded-xl border border-latte/15 transition-all duration-200 active:scale-95 flex items-center gap-2 text-xs cursor-pointer group"
                >
                    <Utensils size={14} className="group-hover:-rotate-12 transition-transform duration-200" /> Menu
                </a>
                <a
                    href="/"
                    target="_blank"
                    className="bg-sage text-cream hover:bg-sage/90 font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-2 text-xs cursor-pointer group"
                >
                    <Store size={14} className="group-hover:scale-110 transition-transform duration-200" /> Store
                </a>
            </div>
        </header>
    );
}
