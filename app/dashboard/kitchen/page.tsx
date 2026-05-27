"use client";

import { useEffect, useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Column } from "@/components/dashboard/SharedComponents";
import OrderCard from "@/components/dashboard/OrderCard";
import { MetricCard } from "@/components/dashboard/SharedComponents";
import { ChefHat, Flame, Utensils, ShoppingBag, Truck, Clock, AlertCircle, CheckCircle, Play, VolumeX } from "lucide-react";

export default function KitchenPage() {
    const { 
        orders, 
        isShiftActive, 
        realtimeStatus,
        missedAudioQueue, 
        startShift, 
        playMissedAudio, 
        handleStatusUpdate 
    } = useDashboardData({ skipCustomers: true });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by returning a clean, server-matching blank loader until client mounted
    if (!mounted) {
        return (
            <div className="min-h-screen bg-dash flex flex-col items-center justify-center text-cream font-sans">
                <ChefHat size={48} className="text-orange-500 mb-4 animate-pulse" />
                <p className="text-latte/60 font-medium">Preparing Kitchen Workspace...</p>
            </div>
        );
    }

    // PHASE 1 & 2: The Interstitial State Lock & Mandatory Interaction Trigger
    if (!isShiftActive) {
        return (
            <div className="fixed inset-0 z-[9999] bg-dash-bg backdrop-blur-sm flex flex-col items-center justify-center text-cream">
                <ChefHat size={64} className="text-orange-500 mb-6 animate-bounce" />
                <h1 className="font-heading text-4xl font-bold mb-4 text-center text-cream">Kitchen Console</h1>
                <p className="text-latte/60 text-center max-w-md mb-8">
                    To ensure the browser allows audio announcements for new incoming orders, you must physically click the button below to begin your shift.
                </p>
                <button
                    onClick={startShift}
                    className="flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-xl transition-all btn-glow shadow-[0_0_40px_rgba(234,88,12,0.4)] hover:shadow-[0_0_60px_rgba(234,88,12,0.6)] hover:scale-105 cursor-pointer"
                >
                    <Play fill="currentColor" />
                    Start Shift (Enable Audio)
                </button>
            </div>
        );
    }

    // 1. MAIN KANBAN LOGIC (Status-based)
    const pendingOrders = orders.filter(o => o.status === "pending");
    const cookingOrders = orders.filter(o => o.status === "cooking");
    const completedOrders = orders.filter(o => o.status === "completed").slice(0, 10);
    const activeOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'cooking').length;

    // 2. ORDER TYPE LOGIC (Channel-based) - For the tables below
    const activeOrders = orders.filter(o => o.status !== "completed" && o.status !== "cancelled");
    const dineInOrders = activeOrders.filter(o => o.order_type === 'dine-in' || !o.order_type);
    const takeoutOrders = activeOrders.filter(o => o.order_type === 'takeout');
    const deliveryOrders = activeOrders.filter(o => o.order_type === 'delivery');

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300 pb-20">
            {/* PHASE 5: The Failsafe Queue Visual Override */}
            {missedAudioQueue.length > 0 && (
                <div 
                    onClick={playMissedAudio}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 cursor-pointer text-red-300 p-4 rounded-xl border-2 border-red-500/30 flex items-center justify-between animate-pulse transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <VolumeX size={24} className="animate-bounce" />
                        <div>
                            <h3 className="font-bold font-heading text-lg text-red-300">Audio Disconnected!</h3>
                            <p className="text-sm text-red-300/70">The browser blocked {missedAudioQueue.length} order announcement(s).</p>
                        </div>
                    </div>
                    <span className="font-bold bg-red-500 text-white px-4 py-2 rounded-lg text-sm shadow-sm cursor-pointer">
                        Click here to play missed audio
                    </span>
                </div>
            )}

            {/* Header Metrics */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-2 p-2 bg-dash-surface border border-latte/10 rounded-lg w-fit">
                    <ChefHat className="text-orange-400" size={20} />
                    <h2 className="text-lg font-bold font-heading text-latte">Kitchen Console</h2>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Live Sync Status Telemetry */}
                    <div className="card-dash flex items-center gap-2 px-4 py-2 rounded-xl border border-latte/8 text-sm font-bold animate-in fade-in duration-300">
                        <span className="text-latte/40 font-medium">Sync:</span>
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                                realtimeStatus === 'SUBSCRIBED' ? 'bg-emerald-500 animate-pulse' :
                                realtimeStatus === 'CONNECTING' ? 'bg-amber-500 animate-bounce' :
                                'bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                            }`} />
                            <span className={`tracking-wider text-xs ${
                                realtimeStatus === 'SUBSCRIBED' ? 'text-emerald-400' :
                                realtimeStatus === 'CONNECTING' ? 'text-amber-400' :
                                'text-indigo-400'
                            }`}>
                                {realtimeStatus === 'SUBSCRIBED' ? 'LIVE SYNC' :
                                 realtimeStatus === 'CONNECTING' ? 'CONNECTING...' :
                                 'SECURE SYNC'}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            const testAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                            testAudio.play().catch(e => console.error("Audio blocked:", e));
                            alert("If you heard the 'Ting', sound notifications are enabled!");
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-sage/10 hover:bg-sage/20 transition-colors rounded-xl border border-sage/20 text-sm font-bold text-sage cursor-pointer"
                    >
                        🔔 Enable/Test Sound
                    </button>
                    <div className="card-dash flex items-center gap-2 px-4 py-2 rounded-xl border border-latte/8 text-sm font-bold text-latte/60">
                        <Clock size={16} />
                        <span>Avg Prep Time: 12m</span>
                    </div>
                </div>
            </div>

            <MetricCard
                title="Active Orders"
                value={activeOrdersCount}
                icon={<Flame className="text-orange-500" size={24} />}
                color="border-orange-500 bg-orange-500/10"
                trend={`${pendingOrders.length} Pending`}
            />

            {/* SECTION 1: MAIN KANBAN BOARD (Workflow) */}
            <div>
                <h3 className="text-sm font-bold text-latte/40 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Flame size={16} /> Live Workflow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
                    <Column
                        title="PENDING"
                        count={pendingOrders.length}
                        color="bg-dash-surface border-red-500/15"
                        headerColor="bg-red-500/20 text-red-300"
                        icon={<AlertCircle size={18} />}
                    >
                        {pendingOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onAction={() => handleStatusUpdate(order.id, "cooking")}
                                actionLabel="Start Cooking"
                                actionColor="bg-cream text-espresso hover:bg-latte-light"
                                isPending
                            />
                        ))}
                    </Column>

                    <Column
                        title="COOKING"
                        count={cookingOrders.length}
                        color="bg-dash-surface border-amber-500/15"
                        headerColor="bg-amber-500/20 text-amber-300"
                        icon={<ChefHat size={18} />}
                    >
                        {cookingOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onAction={() => handleStatusUpdate(order.id, "completed")}
                                actionLabel="Mark Ready"
                                actionColor="bg-sage text-cream hover:bg-sage-light"
                            />
                        ))}
                    </Column>

                    <Column
                        title="READY"
                        count={completedOrders.length}
                        color="bg-dash-surface border-latte/10"
                        headerColor="bg-latte/10 text-latte/70"
                        icon={<CheckCircle size={18} />}
                    >
                        {completedOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                isCompleted
                            />
                        ))}
                    </Column>
                </div>
            </div>

            {/* SECTION 2: ORDER TYPE BREAKDOWN (Tables) */}
            <div>
                <h3 className="text-sm font-bold text-latte/40 mb-4 uppercase tracking-wider flex items-center gap-2 mt-8">
                    <Utensils size={16} /> Channel Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Dine-In Table */}
                    <div className="bg-dash-surface rounded-2xl border border-latte/8 overflow-hidden">
                        <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/15 flex justify-between items-center">
                            <span className="font-bold text-blue-300 flex items-center gap-2 text-sm"><Utensils size={14} /> Dine-In</span>
                            <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold">{dineInOrders.length}</span>
                        </div>
                        <div className="p-2 max-h-[300px] overflow-y-auto dash-scrollbar">
                            {dineInOrders.length === 0 && <p className="text-center text-xs text-latte/30 py-4">No active orders</p>}
                            {dineInOrders.map(order => (
                                <ChannelOrderRow key={order.id} order={order} />
                            ))}
                        </div>
                    </div>

                    {/* Takeout Table */}
                    <div className="bg-dash-surface rounded-2xl border border-latte/8 overflow-hidden">
                        <div className="px-4 py-3 bg-purple-500/10 border-b border-purple-500/15 flex justify-between items-center">
                            <span className="font-bold text-purple-300 flex items-center gap-2 text-sm"><ShoppingBag size={14} /> Takeout</span>
                            <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-bold">{takeoutOrders.length}</span>
                        </div>
                        <div className="p-2 max-h-[300px] overflow-y-auto dash-scrollbar">
                            {takeoutOrders.length === 0 && <p className="text-center text-xs text-latte/30 py-4">No active orders</p>}
                            {takeoutOrders.map(order => (
                                <ChannelOrderRow key={order.id} order={order} />
                            ))}
                        </div>
                    </div>

                    {/* Delivery Table */}
                    <div className="bg-dash-surface rounded-2xl border border-latte/8 overflow-hidden">
                        <div className="px-4 py-3 bg-orange-500/10 border-b border-orange-500/15 flex justify-between items-center">
                            <span className="font-bold text-orange-300 flex items-center gap-2 text-sm"><Truck size={14} /> Delivery</span>
                            <span className="bg-orange-500/20 text-orange-300 text-[10px] px-2 py-0.5 rounded-full font-bold">{deliveryOrders.length}</span>
                        </div>
                        <div className="p-2 max-h-[300px] overflow-y-auto dash-scrollbar">
                            {deliveryOrders.length === 0 && <p className="text-center text-xs text-latte/30 py-4">No active orders</p>}
                            {deliveryOrders.map(order => (
                                <ChannelOrderRow key={order.id} order={order} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mini Component for the list rows
function ChannelOrderRow({ order }: { order: any }) {
    return (
        <div className="flex flex-col p-3 mb-2 rounded-xl bg-dash-surface-hover/50 border border-latte/6 hover:bg-dash-surface-hover transition-all">
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-0.5 justify-center">
                    <span className="text-sm font-bold text-cream/90">{order.customers?.name || 'Guest'}</span>
                </div>
                <div className={`px-2 py-1 rounded text-[9px] font-bold tracking-wider uppercase border ${order.status === 'pending' ? 'bg-red-500/15 text-red-300 border-red-500/20' :
                    order.status === 'cooking' ? 'bg-amber-500/15 text-amber-300 border-amber-500/20' : 'bg-sage/15 text-sage border-sage/20'
                    }`}>
                    {order.status}
                </div>
            </div>

            {/* Display Order Items */}
            <div className="flex flex-col gap-1 border-t border-latte/6 pt-2 mt-1">
                {order.items && order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-start text-[11px] leading-tight">
                        <span className="text-latte/40 font-bold w-4">{item.quantity}x</span>
                        <span className="text-latte/70 font-medium flex-1 pl-1">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
