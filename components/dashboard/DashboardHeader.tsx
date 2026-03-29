"use client";

import { usePathname } from "next/navigation";
import { LayoutGrid, Utensils, Store, TrendingUp, ChefHat, Users, QrCode, Settings2 } from "lucide-react";
import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardHeader() {
    const pathname = usePathname();
    const { storeStatus, handleToggleStore } = useDashboardData();

    // Helper to check active state
    const isActive = (path: string) => pathname.includes(path);

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-50 mb-8">
            <div className="flex flex-col gap-1">
                <Link href="/dashboard/kitchen" className="flex items-center gap-2 group cursor-pointer">
                    <div className="bg-espresso text-cream p-1.5 rounded-lg border border-espresso/10 transition-transform group-hover:scale-105 duration-200">
                        <Store size={20} />
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight transition-colors group-hover:text-espresso">Harvest Operations</h1>
                </Link>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wider uppercase ml-[38px]">
                    <span>System Active</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Navigation Buttons */}
                <div className="flex items-center gap-1 mr-4 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <Link
                        href="/dashboard/analytics"
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${isActive('analytics')
                                ? "bg-white text-green-600 shadow-sm border border-slate-100"
                                : "text-slate-600 hover:bg-white hover:text-green-600"
                            }`}
                    >
                        <TrendingUp size={14} /> Analytics
                    </Link>
                    <Link
                        href="/dashboard/kitchen"
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${isActive('kitchen')
                                ? "bg-white text-orange-600 shadow-sm border border-slate-100"
                                : "text-slate-600 hover:bg-white hover:text-orange-600"
                            }`}
                    >
                        <ChefHat size={14} /> Kitchen
                    </Link>
                    <Link
                        href="/dashboard/customers"
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${isActive('customers')
                                ? "bg-white text-purple-600 shadow-sm border border-slate-100"
                                : "text-slate-600 hover:bg-white hover:text-purple-600"
                            }`}
                    >
                        <Users size={14} /> Customers
                    </Link>
                    <Link
                        href="/dashboard/qr"
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${isActive('qr')
                                ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                                : "text-slate-600 hover:bg-white hover:text-blue-600"
                            }`}
                    >
                        <QrCode size={14} /> QR Codes
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors duration-200 flex items-center gap-1 cursor-pointer ${isActive('settings')
                                ? "bg-white text-slate-800 shadow-sm border border-slate-100"
                                : "text-slate-600 hover:bg-white hover:text-slate-800"
                            }`}
                    >
                        <Settings2 size={14} /> Settings
                    </Link>
                </div>

                {storeStatus && (
                    <div className="flex items-center gap-2">
                        {/* Active Load capacity indicator */}
                        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                            <span className="text-xs font-bold text-slate-500">Wait: <span className="text-espresso">{storeStatus.estimatedPrepTime}m</span></span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-xs font-bold text-slate-500">Load: <span className={storeStatus.activeOrders && storeStatus.activeOrders > 10 ? "text-red-500" : "text-orange-600"}>{storeStatus.activeOrders}</span></span>
                        </div>

                        <button
                            onClick={handleToggleStore}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors duration-200 border cursor-pointer active:scale-95 ${storeStatus.isOpen
                                ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                            {storeStatus.isOpen ? "OPEN" : "CLOSED"}
                            {storeStatus.isManual && (
                                <span className="text-[9px] bg-white/50 px-1 py-0.5 rounded ml-1 border border-black/5 opacity-70">
                                    M
                                </span>
                            )}
                        </button>
                    </div>
                )}

                <a
                    href="/dashboard/menu"
                    className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-2 text-xs cursor-pointer group"
                >
                    <Utensils size={14} className="group-hover:-rotate-12 transition-transform duration-200" /> Menu
                </a>
                <a
                    href="/"
                    target="_blank"
                    className="bg-espresso text-cream hover:bg-espresso/90 font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-2 text-xs cursor-pointer group"
                >
                    <Store size={14} className="group-hover:scale-110 transition-transform duration-200" /> Store
                </a>
            </div>
        </header>
    );
}
