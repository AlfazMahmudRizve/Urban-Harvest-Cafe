"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, ChefHat, AlertCircle, TrendingUp, Users, DollarSign, Flame, Utensils } from "lucide-react";
import { updateOrderStatus } from "@/app/actions/updateOrder";
import { RevenueChart, CategoryPieChart } from "@/components/dashboard/AnalyticsCharts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Order = {
    id: string;
    customer_id: string;
    items: any[];
    total_amount: number;
    status: string;
    created_at: string;
    table_number?: string;
    order_type?: string;
    customers?: {
        name: string;
        phone: string;
        visit_count: number;
        total_spend: number;
    };
};

type Customer = {
    id: string;
    name: string;
    phone: string;
    total_spend: number;
    visit_count: number;
};

export default function AdminDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [audio] = useState(typeof Audio !== "undefined" ? new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3") : null);

    // Metrics
    const today = new Date().toISOString().split('T')[0];
    const todaysOrders = orders.filter(o => o.created_at.startsWith(today));
    const totalRevenue = todaysOrders.reduce((acc, o) => acc + o.total_amount, 0);
    const activeOrdersCount = orders.filter(o => fieldStatus(o.status) === 'active').length;
    const aov = todaysOrders.length > 0 ? Math.round(totalRevenue / todaysOrders.length) : 0;

    // Helper for status grouping
    function fieldStatus(status: string) {
        if (status === 'pending') return 'active';
        if (status === 'cooking') return 'active';
        return 'completed';
    }

    // Bestsellers Logic
    const bestsellers = orders.reduce((acc: any, order) => {
        order.items.forEach((item: any) => {
            acc[item.name] = (acc[item.name] || 0) + item.quantity;
        });
        return acc;
    }, {});
    const topItems = Object.entries(bestsellers)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5);

    const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean, message: string, isManual: boolean, expiresAt?: string } | null>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            // Fetch Store Status
            const { getStoreStatus } = await import("@/app/actions/storeStatus");
            const status = await getStoreStatus();
            setStoreStatus(status);

            // Fetch Orders with Customer Data
            const { data: ordersData } = await supabase
                .from("orders")
                .select("*, customers(name, phone, visit_count, total_spend)")
                .order("created_at", { ascending: false });

            if (ordersData) setOrders(ordersData as any);

            // Fetch Top Customers (Whales)
            const { data: customersData } = await supabase
                .from("customers")
                .select("*")
                .order("total_spend", { ascending: false })
                .limit(5);

            if (customersData) setCustomers(customersData);
        };

        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel("realtime_dashboard")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, async (payload) => {
                console.log("New order!", payload);
                // Refetch to get customer relation
                const { data } = await supabase
                    .from("orders")
                    .select("*, customers(name, phone, visit_count, total_spend)")
                    .eq("id", payload.new.id)
                    .single();

                if (data) {
                    setOrders((prev) => [data as any, ...prev]);
                    if (audio) {
                        try { await audio.play(); } catch (e) { console.log('Audio blocked', e); }
                    }
                }
            })
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
                setOrders((prev) => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [audio]);

    const handleStatusUpdate = async (id: string, status: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        await updateOrderStatus(id, status);
    };

    const handleToggleStore = async () => {
        if (!storeStatus) return;
        const { toggleStoreStatus, getStoreStatus } = await import("@/app/actions/storeStatus");

        // Optimistic UI
        const newStatus = !storeStatus.isOpen;
        setStoreStatus(prev => prev ? { ...prev, isOpen: newStatus, isManual: true } : null);

        await toggleStoreStatus(newStatus ? "OPEN" : "CLOSED");
        const updated = await getStoreStatus();
        setStoreStatus(updated);
    };

    const pendingOrders = orders.filter(o => o.status === "pending");
    const cookingOrders = orders.filter(o => o.status === "cooking");
    const completedOrders = orders.filter(o => o.status === "completed").slice(0, 10); // Show last 10 completed

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-8 font-sans">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold font-heading text-gray-900 tracking-tight">Kitchen Command Center</h1>
                    <p className="text-espresso/60 font-medium mt-1">running on Harvest OS 🌿</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Store Toggle */}
                    {storeStatus && (
                        <button
                            onClick={handleToggleStore}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all shadow-sm border active:scale-95 ${storeStatus.isOpen
                                ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                }`}
                        >
                            <div className={`w-3 h-3 rounded-full ${storeStatus.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                            {storeStatus.isOpen ? "Store Open" : "Store Closed"}
                            {storeStatus.isManual && (
                                <span className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded ml-1 border border-black/5">
                                    MANUAL
                                </span>
                            )}
                        </button>
                    )}

                    <a
                        href="/dashboard/menu"
                        className="bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Utensils size={18} /> Manage Menu
                    </a>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-bold text-gray-700">Live Socket Connected</span>
                    </div>
                </div>
            </header>

            {/* SECTION 1: HEADS-UP DISPLAY & ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MetricCard
                            title="Revenue (Today)"
                            value={`৳${totalRevenue.toLocaleString()}`}
                            icon={<DollarSign className="text-green-600" size={28} />}
                            color="border-green-500"
                            trend="RevOps Logic: Motivation 🚀"
                        />
                        <MetricCard
                            title="Active Orders"
                            value={activeOrdersCount}
                            icon={<Flame className="text-orange-500" size={28} />}
                            color="border-orange-500"
                            trend={`${pendingOrders.length} Pending Attention`}
                        />
                        <MetricCard
                            title="Avg Order Value"
                            value={`৳${aov}`}
                            icon={<TrendingUp className="text-blue-600" size={28} />}
                            color="border-blue-500"
                            trend={aov < 300 ? "⚠️ Low: Suggest Sides!" : "✅ Healthy"}
                        />
                    </div>

                    {/* Main Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <RevenueChart orders={orders} />
                    </div>
                </div>

                {/* Side Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <CategoryPieChart orders={orders} />
                </div>
            </div>

            {/* SECTION 2: KITCHEN OS (KANBAN) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                {/* Pending Column */}
                <Column
                    title="PENDING"
                    count={pendingOrders.length}
                    color="bg-red-50/50 border-red-200"
                    headerColor="bg-red-600 text-white"
                    icon={<AlertCircle size={20} />}
                >
                    {pendingOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onAction={() => handleStatusUpdate(order.id, "cooking")}
                            actionLabel="Start Cooking"
                            actionColor="bg-gray-900 hover:bg-gray-800 text-white"
                            isPending
                        />
                    ))}
                </Column>

                {/* Cooking Column */}
                <Column
                    title="COOKING"
                    count={cookingOrders.length}
                    color="bg-yellow-50/50 border-yellow-200"
                    headerColor="bg-yellow-400 text-black"
                    icon={<ChefHat size={20} />}
                >
                    {cookingOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onAction={() => handleStatusUpdate(order.id, "completed")}
                            actionLabel="Mark Ready"
                            actionColor="bg-green-600 hover:bg-green-700 text-white"
                        />
                    ))}
                </Column>

                {/* Completed Column */}
                <Column
                    title="READY"
                    count={completedOrders.length}
                    color="bg-gray-50 border-gray-200"
                    headerColor="bg-gray-200 text-gray-700"
                    icon={<CheckCircle size={20} />}
                >
                    {completedOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            isCompleted
                        />
                    ))}
                </Column>
            </section>

            {/* SECTION 3: REVOPS CRM */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Whale List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="text-purple-600" />
                        <h2 className="text-xl font-bold font-heading">The &quot;Whale&quot; List 🐋</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs uppercase text-gray-400 border-b">
                                    <th className="pb-3">Customer</th>
                                    <th className="pb-3">Visits</th>
                                    <th className="pb-3 text-right">Total Spend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.map(c => (
                                    <tr key={c.id} className="text-sm font-medium">
                                        <td className="py-3">
                                            <div className="font-bold text-gray-900">{c.name}</div>
                                            <div className="text-xs text-gray-500">{c.phone}</div>
                                        </td>
                                        <td className="py-3 text-gray-600">{c.visit_count}</td>
                                        <td className="py-3 text-right font-bold text-green-600">৳{c.total_spend.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Menu Performance */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Utensils className="text-metro" />
                        <h2 className="text-xl font-bold font-heading">Menu Bestsellers 🏆</h2>
                    </div>
                    <div className="space-y-4">
                        {topItems.map(([name, count]: any, idx) => (
                            <div key={name} className="flex items-center gap-4">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {idx + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="font-bold text-gray-800">{name}</div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className="bg-metro h-full rounded-full"
                                            style={{ width: `${(count / (topItems[0][1] as number)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="font-bold text-gray-900">{count} sold</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

// Sub-components

function MetricCard({ title, value, icon, color, trend }: any) {
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${color} flex items-center justify-between`}>
            <div>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">{title}</p>
                <div className="text-4xl font-extrabold font-heading mt-1 text-gray-900">{value}</div>
                <p className="text-xs font-medium text-gray-400 mt-2">{trend}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
                {icon}
            </div>
        </div>
    );
}

function Column({ title, count, color, headerColor, icon, children }: any) {
    return (
        <div className={`flex flex-col rounded-2xl border ${color} h-full overflow-hidden bg-white shadow-sm`}>
            <div className={`p-4 font-bold flex justify-between items-center ${headerColor}`}>
                <div className="flex items-center gap-2 uppercase tracking-widest text-sm">
                    {icon}
                    {title}
                </div>
                <span className="bg-black/20 text-white px-2 py-1 rounded text-xs font-bold">{count}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                <AnimatePresence mode="popLayout">
                    {children}
                </AnimatePresence>
            </div>
        </div>
    );
}

function OrderCard({ order, onAction, actionLabel, actionColor, isPending, isCompleted }: any) {
    // Determine customer status tag
    const isNewCustomer = order.customers?.visit_count === 1;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: 1,
                borderColor: isPending ? "rgba(239, 68, 68, 0.5)" : "rgba(229, 231, 235, 1)"
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white p-5 rounded-xl border-2 shadow-sm flex flex-col gap-3 relative overflow-hidden ${isPending ? 'animate-pulse-border' : ''} ${isCompleted ? 'opacity-70 grayscale' : ''}`}
        >
            {isPending && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-bl-lg animate-ping" />
            )}

            {/* Header: Time & ID */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
                    <Clock size={12} />
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="font-mono font-bold text-gray-300">#{order.id.slice(0, 4)}</div>
            </div>

            {/* Customer Info */}
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">
                        {order.customers?.name || "Guest"}
                    </h3>
                    {isNewCustomer ? (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                    ) : (
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">RETURNING</span>
                    )}
                </div>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{order.customers?.phone}</p>
            </div>

            {/* Order Items */}
            <div className="space-y-1 my-1">
                {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm font-medium text-gray-700 border-b border-dashed border-gray-100 last:border-0 pb-1 last:pb-0">
                        <span>{item.quantity}x {item.name}</span>
                    </div>
                ))}
            </div>

            {/* Footer: Type & Total */}
            <div className="flex justify-between items-center pt-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${order.order_type === 'dine-in' ? "bg-blue-50 text-blue-700" :
                        order.order_type === 'takeout' ? "bg-purple-50 text-purple-700" :
                            "bg-orange-50 text-orange-700"
                    }`}>
                    {order.order_type === 'dine-in' && <>🍽 T-{order.table_number}</>}
                    {order.order_type === 'takeout' && <>🛍️ Takeout</>}
                    {order.order_type === 'delivery' && <>🚚 Delivery</>}
                    {(!order.order_type) && <>🚚 Delivery</>} {/* Fallback for old orders */}
                </span>
                <span className="font-extrabold text-lg text-gray-900">৳{order.total_amount}</span>
            </div>

            {/* Action Button */}
            {!isCompleted && onAction && (
                <button
                    onClick={onAction}
                    className={`w-full py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 mt-2 ${actionColor}`}
                >
                    {actionLabel}
                </button>
            )}
        </motion.div>
    );
}
