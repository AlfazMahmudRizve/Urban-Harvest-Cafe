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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-card-dark p-4 rounded-2xl border border-latte/8 sticky top-4 z-50 mb-8">
            <div className="flex flex-col gap-1">
                <Link href="/dashboard/kitchen" className="flex items-center gap-2 group cursor-pointer">
                    <div className="bg-sage/20 text-sage p-1.5 rounded-lg border border-sage/10 transition-transform group-hover:scale-105 duration-200">
                        <Store size={20} />
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-cream tracking-tight transition-colors group-hover:text-latte">Urban Harvest Hub</h1>
                </Link>
                <div className="flex items-center gap-2 text-xs font-semibold text-latte/40 tracking-wider uppercase ml-[38px]">
                    <span>Kitchen Feed Active</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Navigation Buttons */}
                <div className="flex items-center gap-1 mr-4 bg-dash-surface p-1 rounded-lg border border-latte/8">
                    <Link
                        href="/dashboard/analytics"
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${isActive('analytics')
                                ? "bg-dash-surface-hover text-green-400 border border-latte/10"
                                : "text-latte/50 hover:text-latte hover:bg-dash-surface-hover"
                            }`}
                    >
                        <TrendingUp size={14} /> Analytics
                    </Link>
                    <Link
                        href="/dashboard/kitchen"
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${isActive('kitchen')
                                ? "bg-dash-surface-hover text-orange-400 border border-latte/10"
                                : "text-latte/50 hover:text-latte hover:bg-dash-surface-hover"
                            }`}
                    >
                        <ChefHat size={14} /> Kitchen
                    </Link>
                    <Link
                        href="/dashboard/customers"
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${isActive('customers')
                                ? "bg-dash-surface-hover text-purple-400 border border-latte/10"
                                : "text-latte/50 hover:text-latte hover:bg-dash-surface-hover"
                            }`}
                    >
                        <Users size={14} /> Customers
                    </Link>
                    <Link
                        href="/dashboard/qr"
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${isActive('qr')
                                ? "bg-dash-surface-hover text-blue-400 border border-latte/10"
                                : "text-latte/50 hover:text-latte hover:bg-dash-surface-hover"
                            }`}
                    >
                        <QrCode size={14} /> QR Codes
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${isActive('settings')
                                ? "bg-dash-surface-hover text-cream border border-latte/10"
                                : "text-latte/50 hover:text-latte hover:bg-dash-surface-hover"
                            }`}
                    >
                        <Settings2 size={14} /> Settings
                    </Link>
                </div>

                {storeStatus && (
                    <div className="flex items-center gap-2">
                        {/* Active Load capacity indicator */}
                        <div className="hidden lg:flex items-center gap-2 bg-dash-surface border border-latte/8 rounded-lg px-3 py-1.5">
                            <span className="text-xs font-bold text-latte/60">Wait: <span className="text-latte">{storeStatus.estimatedPrepTime}m</span></span>
                            <span className="w-1 h-1 bg-latte/20 rounded-full" />
                            <span className="text-xs font-bold text-latte/60">Load: <span className={storeStatus.activeOrders && storeStatus.activeOrders > 10 ? "text-red-400" : "text-orange-400"}>{storeStatus.activeOrders}</span></span>
                        </div>

                        <button
                            onClick={handleToggleStore}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors duration-200 border cursor-pointer active:scale-95 ${storeStatus.isOpen
                                ? "bg-sage/15 text-sage border-sage/20 hover:bg-sage/25"
                                : "bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/25"
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? "bg-sage animate-pulse" : "bg-red-500"}`} />
                            {storeStatus.isOpen ? "OPEN" : "CLOSED"}
                            {storeStatus.isManual && (
                                <span className="text-[9px] bg-white/10 px-1 py-0.5 rounded ml-1 border border-white/5 opacity-70">
                                    M
                                </span>
                            )}
                        </button>
                    </div>
                )}

                <a
                    href="/dashboard/menu"
                    className="bg-dash-surface text-latte hover:bg-dash-surface-hover font-bold px-3 py-1.5 rounded-lg border border-latte/10 transition-all duration-200 active:scale-95 flex items-center gap-2 text-xs cursor-pointer group"
                >
                    <Utensils size={14} className="group-hover:-rotate-12 transition-transform duration-200" /> Menu
                </a>
                <a
                    href="/"
                    target="_blank"
                    className="bg-sage text-cream hover:bg-sage-light font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-2 text-xs cursor-pointer group"
                >
                    <Store size={14} className="group-hover:scale-110 transition-transform duration-200" /> Store
                </a>
            </div>
        </header>
    );
}
