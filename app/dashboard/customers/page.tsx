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
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg w-fit">
                    <Users className="text-purple-600" size={20} />
                    <h2 className="text-lg font-bold font-heading text-purple-800">Customers CRM</h2>
                </div>

                <button
                    onClick={() => alert("Add Customer Feature Coming Soon!")}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-sm text-sm"
                >
                    <UserPlus size={16} />
                    Add New Customer
                </button>
            </div>

            <div className="bg-white p-0 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                    <div className="flex items-center gap-2">
                        <Users className="text-purple-600" size={20} />
                        <h2 className="text-md font-bold font-heading text-purple-900">VIP Leaderboard 👑</h2>
                    </div>
                </div>

                <div className="p-6">
                    {/* VIPs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {topWhales.map((c, idx) => (
                            <div key={c.id} className="flex flex-col items-center justify-center p-6 bg-yellow-50/50 border border-yellow-100 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-all text-center">
                                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />
                                <div className="w-16 h-16 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center font-black text-2xl shadow-sm ring-4 ring-white mb-3">
                                    #{idx + 1}
                                </div>
                                <div className="font-bold text-gray-900 text-lg mb-1 flex items-center justify-center gap-1">
                                    {c.name}
                                    {idx === 0 && <span>🏆</span>}
                                </div>
                                <div className="text-xs text-gray-500 font-mono mb-4">{c.phone}</div>

                                <div className="bg-white px-4 py-2 rounded-lg border border-yellow-100 shadow-sm w-full">
                                    <div className="font-black text-xl text-green-600">৳{c.total_spend.toLocaleString()}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{c.visit_count} Orders</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    {regularCustomers.length > 0 && (
                        <div className="text-center text-xs text-gray-400 my-6 font-bold uppercase tracking-widest relative">
                            <span className="bg-white px-4 relative z-10 text-gray-500">All Customers</span>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 -z-0" />
                        </div>
                    )}

                    {/* Other Customers - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {regularCustomers.map((c, idx) => (
                            <div key={c.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200 group bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-100 text-gray-400 flex items-center justify-center font-bold text-xs group-hover:bg-gray-200 group-hover:text-gray-700 transition-colors">
                                        {idx + 4}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-700 text-sm group-hover:text-gray-900">{c.name}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">{c.phone}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-600 text-sm group-hover:text-green-600">৳{c.total_spend.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
