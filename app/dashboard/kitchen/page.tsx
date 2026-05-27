"use client";

import { useEffect, useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Column } from "@/components/dashboard/SharedComponents";
import OrderCard from "@/components/dashboard/OrderCard";
import { ChefHat, Flame, Utensils, ShoppingBag, Truck, Clock, AlertCircle, CheckCircle, Play, VolumeX, Layers, Activity } from "lucide-react";

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
    const [viewMode, setViewMode] = useState<"workflow" | "logistics">("workflow");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by returning a clean, server-matching blank loader until client mounted
    if (!mounted) {
        return (
            <div className="min-h-screen bg-dash flex flex-col items-center justify-center text-espresso font-sans">
                <ChefHat size={48} className="text-orange-600 mb-4 animate-pulse" />
                <p className="text-espresso/60 font-medium">Preparing Kitchen Workspace...</p>
            </div>
        );
    }

    // PHASE 1 & 2: The Interstitial State Lock & Mandatory Interaction Trigger
    if (!isShiftActive) {
        return (
            <div className="fixed inset-0 z-[9999] bg-cream-warm/95 backdrop-blur-md flex flex-col items-center justify-center text-espresso animate-in fade-in duration-300">
                <ChefHat size={64} className="text-orange-600 mb-6 animate-bounce" />
                <h1 className="font-heading text-4xl font-bold mb-4 text-center text-espresso">Kitchen Console</h1>
                <p className="text-espresso/60 text-center max-w-md mb-8">
                    To ensure the browser allows audio announcements for new incoming orders, you must physically click the button below to begin your shift.
                </p>
                <button
                    onClick={startShift}
                    className="flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-xl transition-all btn-glow shadow-[0_0_40px_rgba(234,88,12,0.25)] hover:scale-105 cursor-pointer"
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

    // 2. ORDER TYPE LOGIC (Channel-based) - For logistics view
    const activeOrders = orders.filter(o => o.status !== "completed" && o.status !== "cancelled");
    const dineInOrders = activeOrders.filter(o => o.order_type === 'dine-in' || !o.order_type);
    const takeoutOrders = activeOrders.filter(o => o.order_type === 'takeout');
    const deliveryOrders = activeOrders.filter(o => o.order_type === 'delivery');

    return (
        <div className="lg:h-[calc(100vh-170px)] lg:overflow-hidden flex flex-col gap-5 animate-in fade-in zoom-in duration-300 pb-20 lg:pb-0 max-w-[1600px] w-full mx-auto">
            {/* PHASE 5: The Failsafe Queue Visual Override */}
            {missedAudioQueue.length > 0 && (
                <div 
                    onClick={playMissedAudio}
                    className="w-full bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center justify-between animate-pulse transition-colors cursor-pointer shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <VolumeX size={24} className="animate-bounce" />
                        <div>
                            <h3 className="font-bold font-heading text-lg">Audio Disconnected!</h3>
                            <p className="text-sm opacity-80">The browser blocked {missedAudioQueue.length} order announcement(s).</p>
                        </div>
                    </div>
                    <span className="font-bold bg-red-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm cursor-pointer hover:bg-red-700 transition-colors">
                        Click here to play missed audio
                    </span>
                </div>
            )}

            {/* Header Control Center */}
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between bg-white p-4 rounded-2xl border border-latte/10 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-500/10 text-orange-600 p-2 rounded-xl">
                        <ChefHat size={22} className="animate-warm-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-heading text-espresso tracking-tight">Kitchen Workspace</h2>
                        <p className="text-[10px] text-espresso/40 font-bold uppercase tracking-wider">Real-time Culinary Console</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Live Sync Status Telemetry */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-cream-warm/40 border border-latte/10 rounded-xl text-sm font-bold shadow-inner-warm">
                        <span className="text-espresso/50 font-bold text-xs">Sync:</span>
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                                realtimeStatus === 'SUBSCRIBED' ? 'bg-emerald-500 animate-pulse' :
                                realtimeStatus === 'CONNECTING' ? 'bg-amber-500 animate-bounce' :
                                'bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.35)]'
                            }`} />
                            <span className={`tracking-wider text-xs font-black ${
                                realtimeStatus === 'SUBSCRIBED' ? 'text-emerald-700' :
                                realtimeStatus === 'CONNECTING' ? 'text-amber-700' :
                                'text-indigo-600'
                            }`}>
                                {realtimeStatus === 'SUBSCRIBED' ? 'LIVE' :
                                 realtimeStatus === 'CONNECTING' ? 'WAITING...' :
                                 'SECURE'}
                            </span>
                        </div>
                    </div>

                    {/* Test Sound Button */}
                    <button 
                        onClick={() => {
                            const testAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                            testAudio.play().catch(e => console.error("Audio blocked:", e));
                            alert("If you heard the 'Ting', sound notifications are enabled!");
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-sage/10 hover:bg-sage/20 transition-all rounded-xl border border-sage/20 text-sm font-bold text-sage hover-lift cursor-pointer"
                    >
                        🔔 Test Alert Sound
                    </button>

                    {/* Average Prep Time Tag */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-cream-warm/40 border border-latte/10 rounded-xl text-sm font-bold text-espresso/60 shadow-inner-warm">
                        <Clock size={16} className="text-latte" />
                        <span className="text-xs">Avg Prep: <span className="text-espresso font-black">12m</span></span>
                    </div>
                </div>
            </div>

            {/* Compact Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
                <div className="bg-white rounded-2xl p-5 border border-latte/10 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-espresso/45 uppercase tracking-wider">Active Cravings</span>
                        <h4 className="text-3xl font-black text-espresso font-heading">{activeOrdersCount}</h4>
                    </div>
                    <div className="p-3.5 bg-orange-500/10 text-orange-600 rounded-xl group-hover:bg-orange-500/15 transition-colors">
                        <Flame size={22} className="animate-pulse" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-latte/10 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-espresso/45 uppercase tracking-wider">Pending Tray Prep</span>
                        <h4 className="text-3xl font-black text-red-600 font-heading">{pendingOrders.length}</h4>
                    </div>
                    <div className="p-3.5 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors">
                        <AlertCircle size={22} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-latte/10 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-espresso/45 uppercase tracking-wider">Currently In Oven</span>
                        <h4 className="text-3xl font-black text-amber-600 font-heading">{cookingOrders.length}</h4>
                    </div>
                    <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors">
                        <ChefHat size={22} className="animate-warm-pulse" />
                    </div>
                </div>
            </div>

            {/* Reorganized Workspace Mode Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-latte/10 pb-4 pt-2 flex-shrink-0">
                <div className="flex bg-cream-warm/60 p-1.5 rounded-2xl border border-latte/15 gap-1 shadow-inner-warm">
                    <button
                        onClick={() => setViewMode("workflow")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer hover-lift ${
                            viewMode === "workflow"
                                ? "bg-espresso text-cream shadow-glow-espresso scale-[1.02]"
                                : "text-espresso/60 hover:text-espresso hover:bg-cream-warm/40"
                        }`}
                    >
                        <ChefHat size={16} /> Live Kanban Board
                    </button>
                    <button
                        onClick={() => setViewMode("logistics")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer hover-lift ${
                            viewMode === "logistics"
                                ? "bg-espresso text-cream shadow-glow-espresso scale-[1.02]"
                                : "text-espresso/60 hover:text-espresso hover:bg-cream-warm/40"
                        }`}
                    >
                        <Utensils size={16} /> Channel Logistics
                    </button>
                </div>

                <div className="text-xs text-espresso/40 font-bold uppercase tracking-wider flex items-center gap-2 pr-2">
                    <Activity size={12} className="text-sage" /> Status: Operational
                </div>
            </div>

            {/* Dynamic View Workspace */}
            <div className="flex-1 min-h-0 lg:h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                {viewMode === "workflow" ? (
                    /* WORKFLOW KANBAN BOARD */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[480px]">
                        <Column
                            title="PENDING"
                            count={pendingOrders.length}
                            color="bg-white/90 border-red-500/10 shadow-sm"
                            headerColor="bg-red-50 text-red-700 border-b border-red-100"
                            icon={<AlertCircle size={18} />}
                        >
                            {pendingOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onAction={() => handleStatusUpdate(order.id, "cooking")}
                                    actionLabel="Start Cooking"
                                    actionColor="bg-cream-warm hover:bg-latte-light text-espresso border border-latte/20"
                                    isPending
                                />
                            ))}
                        </Column>

                        <Column
                            title="COOKING"
                            count={cookingOrders.length}
                            color="bg-white/90 border-amber-500/10 shadow-sm"
                            headerColor="bg-amber-50 text-amber-700 border-b border-amber-100"
                            icon={<ChefHat size={18} />}
                        >
                            {cookingOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onAction={() => handleStatusUpdate(order.id, "completed")}
                                    actionLabel="Mark Ready"
                                    actionColor="bg-sage text-cream hover:bg-sage/90 shadow-md"
                                />
                            ))}
                        </Column>

                        <Column
                            title="READY"
                            count={completedOrders.length}
                            color="bg-white/90 border-latte/15 shadow-sm"
                            headerColor="bg-cream-warm/75 text-espresso border-b border-latte/20"
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
                ) : (
                    /* CHANNEL LOGISTICS TABLES */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[480px]">
                        {/* Dine-In Table Container */}
                        <div className="bg-white rounded-3xl border border-latte/10 flex flex-col overflow-hidden shadow-sm h-full">
                            <div className="px-5 py-4 bg-blue-50/70 border-b border-blue-100 flex justify-between items-center flex-shrink-0">
                                <span className="font-bold text-blue-700 flex items-center gap-2.5 text-sm">
                                    <Utensils size={16} /> Dine-In Tray Prep
                                </span>
                                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-black">
                                    {dineInOrders.length}
                                </span>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 space-y-3 dash-scrollbar bg-cream-warm/10">
                                {dineInOrders.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-espresso/30 py-20">
                                        <Utensils size={36} className="opacity-30 mb-2" />
                                        <p className="text-xs font-bold">No Active Dine-In Orders</p>
                                    </div>
                                ) : (
                                    dineInOrders.map(order => (
                                        <ChannelOrderRow key={order.id} order={order} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Takeout Table Container */}
                        <div className="bg-white rounded-3xl border border-latte/10 flex flex-col overflow-hidden shadow-sm h-full">
                            <div className="px-5 py-4 bg-purple-50/70 border-b border-purple-100 flex justify-between items-center flex-shrink-0">
                                <span className="font-bold text-purple-700 flex items-center gap-2.5 text-sm">
                                    <ShoppingBag size={16} /> Takeout Express
                                </span>
                                <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-black">
                                    {takeoutOrders.length}
                                </span>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 space-y-3 dash-scrollbar bg-cream-warm/10">
                                {takeoutOrders.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-espresso/30 py-20">
                                        <ShoppingBag size={36} className="opacity-30 mb-2" />
                                        <p className="text-xs font-bold">No Active Takeout Orders</p>
                                    </div>
                                ) : (
                                    takeoutOrders.map(order => (
                                        <ChannelOrderRow key={order.id} order={order} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Delivery Table Container */}
                        <div className="bg-white rounded-3xl border border-latte/10 flex flex-col overflow-hidden shadow-sm h-full">
                            <div className="px-5 py-4 bg-orange-50/70 border-b border-orange-100 flex justify-between items-center flex-shrink-0">
                                <span className="font-bold text-orange-700 flex items-center gap-2.5 text-sm">
                                    <Truck size={16} /> Delivery Logistics
                                </span>
                                <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-0.5 rounded-full font-black">
                                    {deliveryOrders.length}
                                </span>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 space-y-3 dash-scrollbar bg-cream-warm/10">
                                {deliveryOrders.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-espresso/30 py-20">
                                        <Truck size={36} className="opacity-30 mb-2" />
                                        <p className="text-xs font-bold">No Active Delivery Orders</p>
                                    </div>
                                ) : (
                                    deliveryOrders.map(order => (
                                        <ChannelOrderRow key={order.id} order={order} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Mini Component for the list rows
function ChannelOrderRow({ order }: { order: any }) {
    return (
        <div className="flex flex-col p-4 rounded-2xl bg-white border border-latte/8 hover:shadow-md hover:border-latte/15 transition-all">
            <div className="flex justify-between items-start mb-2.5">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-espresso">{order.customers?.name || 'Guest'}</span>
                    <span className="text-[10px] text-espresso/35 font-mono">ID: {order.id.slice(0, 8)}</span>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border ${
                    order.status === 'pending' ? 'bg-red-50 text-red-700 border-red-100' :
                    order.status === 'cooking' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                    'bg-sage/10 text-sage border-sage/20'
                }`}>
                    {order.status}
                </div>
            </div>

            {/* Display Order Items */}
            <div className="flex flex-col gap-1.5 border-t border-dashed border-latte/10 pt-2.5 mt-1">
                {order.items && order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-start text-xs leading-normal">
                        <span className="text-sage font-black w-5">{item.quantity}x</span>
                        <span className="text-espresso/80 font-medium flex-1 pl-0.5">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
