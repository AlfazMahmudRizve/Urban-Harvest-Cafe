"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { Users, UserPlus } from "lucide-react";

export default function CustomersPage() {
    const { customers } = useDashboardData({ skipOrders: true, skipRealtime: true });

    // Customer Ranking Logic
    const sortedCustomers = [...customers].sort((a, b) => b.total_spend - a.total_spend);
    const topWhales = sortedCustomers.slice(0, 3);
    const regularCustomers = sortedCustomers.slice(3);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-100/50 rounded-lg w-fit">
                    <Users className="text-purple-600" size={20} />
                    <h2 className="text-lg font-bold font-heading text-purple-800">Customers CRM</h2>
                </div>

                <button
                    onClick={() => alert("Add Customer Feature Coming Soon!")}
                    className="flex items-center gap-2 bg-sage hover:bg-sage/90 text-cream px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-md shadow-sage/10 text-sm cursor-pointer"
                >
                    <UserPlus size={16} />
                    Add New Customer
                </button>
            </div>

            <div className="glass-card p-0 rounded-2xl border border-latte/15 overflow-hidden shadow-md">
                <div className="p-5 border-b border-latte/15 bg-gradient-to-r from-purple-50/40 via-white/40 to-transparent">
                    <div className="flex items-center gap-2">
                        <Users className="text-purple-600" size={20} />
                        <h2 className="text-md font-bold font-heading text-purple-800">VIP Leaderboard 👑</h2>
                    </div>
                </div>

                <div className="p-6">
                    {/* VIPs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {topWhales.map((c, idx) => (
                            <div key={c.id} className="flex flex-col items-center justify-center p-6 bg-yellow-50/20 border border-yellow-200/40 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all text-center">
                                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />
                                <div className="w-16 h-16 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center font-black text-2xl shadow-sm ring-4 ring-white mb-3">
                                    #{idx + 1}
                                </div>
                                <div className="font-bold text-espresso text-lg mb-1 flex items-center justify-center gap-1">
                                    {c.name}
                                    {idx === 0 && <span>🏆</span>}
                                </div>
                                <div className="text-xs text-espresso/45 font-mono mb-4">{c.phone}</div>

                                <div className="bg-white px-4 py-2 rounded-xl border border-yellow-200/50 shadow-sm w-full">
                                    <div className="font-black text-xl text-emerald-600">৳{c.total_spend.toLocaleString()}</div>
                                    <div className="text-[10px] text-espresso/40 font-bold uppercase tracking-wider">{c.visit_count} Orders</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    {regularCustomers.length > 0 && (
                        <div className="text-center text-xs text-espresso/45 my-6 font-bold uppercase tracking-widest relative">
                            <span className="bg-white px-4 relative z-10 text-espresso/50">All Customers</span>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-latte/15 -z-0" />
                        </div>
                    )}

                    {/* Other Customers - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {regularCustomers.map((c, idx) => (
                            <div key={c.id} className="flex items-center justify-between p-3.5 hover:bg-cream-warm/40 rounded-xl transition-all border border-transparent hover:border-latte/15 group bg-cream-warm/15">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-latte/15 text-espresso/40 flex items-center justify-center font-bold text-xs group-hover:bg-cream-warm group-hover:text-espresso transition-colors">
                                        {idx + 4}
                                    </div>
                                    <div>
                                        <div className="font-bold text-espresso text-sm group-hover:text-sage transition-colors duration-200">{c.name}</div>
                                        <div className="text-[10px] text-espresso/40 font-mono">{c.phone}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-espresso text-sm group-hover:text-emerald-600 transition-colors duration-200">৳{c.total_spend.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
