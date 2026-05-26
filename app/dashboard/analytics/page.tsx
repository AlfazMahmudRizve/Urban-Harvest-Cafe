"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { MetricCard } from "@/components/dashboard/SharedComponents";
import { RevenueChart, CategoryPieChart } from "@/components/dashboard/AnalyticsCharts";
import { TrendingUp, DollarSign, Utensils } from "lucide-react";

export default function AnalyticsPage() {
    const { orders } = useDashboardData({ skipCustomers: true, skipRealtime: true });

    // Metrics Logic
    const today = new Date().toISOString().split('T')[0];
    const todaysOrders = orders.filter(o => o.created_at.startsWith(today));
    const totalRevenue = todaysOrders.reduce((acc, o) => acc + o.total_amount, 0);
    const aov = todaysOrders.length > 0 ? Math.round(totalRevenue / todaysOrders.length) : 0;

    // Bestsellers Logic
    const bestsellers = orders.reduce((acc: any, order) => {
        order.items.forEach((item: any) => {
            acc[item.name] = (acc[item.name] || 0) + item.quantity;
        });
        return acc;
    }, {});
    const topItems = Object.entries(bestsellers)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 10);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-2 mb-2 p-2 bg-green-50 rounded-lg w-fit">
                <TrendingUp className="text-green-600" size={20} />
                <h2 className="text-lg font-bold font-heading text-green-800">Analytics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard
                    title="Revenue (Today)"
                    value={`৳${totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="text-green-600" size={24} />}
                    color="border-green-500 bg-green-50/10"
                    trend="RevOps Logic"
                />
                <MetricCard
                    title="Avg Order Value"
                    value={`৳${aov}`}
                    icon={<TrendingUp className="text-blue-600" size={24} />}
                    color="border-blue-500 bg-blue-50/10"
                    trend={aov < 300 ? "⚠️ Low" : "✅ Healthy"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Weekly Revenue</h3>
                    <RevenueChart orders={orders} />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Category Split</h3>
                    <CategoryPieChart orders={orders} />
                </div>
            </div>

            {/* Bestsellers Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <Utensils className="text-metro" size={20} />
                    <h2 className="text-md font-bold font-heading">All-Time Bestsellers 🏆</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {topItems.map(([name, count]: any, idx: number) => (
                        <div key={name} className="flex items-center gap-4 group">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shadow-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-50' : 'bg-gray-100 text-gray-600'}`}>
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="font-bold text-sm text-gray-800 group-hover:text-metro transition-colors">{name}</div>
                                    <div className="font-black text-xs text-gray-900">{count} sold</div>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-metro h-full rounded-full transition-all duration-1000 ease-out group-hover:bg-espresso"
                                        style={{ width: `${(count / (topItems[0]?.[1] as number || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
