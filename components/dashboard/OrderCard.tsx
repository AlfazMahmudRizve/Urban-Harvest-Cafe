"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, Utensils, ShoppingBag, Truck } from "lucide-react";
import { Order } from "@/hooks/useDashboardData";

interface OrderCardProps {
    order: Order;
    onAction?: () => void;
    actionLabel?: string;
    actionColor?: string;
    isPending?: boolean;
    isCompleted?: boolean;
}

export default function OrderCard({ order, onAction, actionLabel, actionColor, isPending, isCompleted }: OrderCardProps) {
    // Determine customer status tag
    const isNewCustomer = order.customers?.visit_count === 1;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: 1,
                borderColor: isPending ? "rgba(239, 68, 68, 0.3)" : "rgba(221, 190, 169, 0.08)"
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-dash-surface p-5 rounded-xl border-2 border-latte/8 flex flex-col gap-3 relative overflow-hidden ${isPending ? 'animate-pulse-border' : ''} ${isCompleted ? 'opacity-50' : ''}`}
        >
            {isPending && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-400 rounded-bl-lg animate-ping" />
            )}

            {/* Header: Time & ID */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-latte/40 text-xs font-bold uppercase">
                    <Clock size={12} />
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="font-mono font-bold text-latte/20">#{order.id.slice(0, 4)}</div>
            </div>

            {/* Customer Info */}
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-cream leading-tight">
                        {order.customers?.name || "Guest"}
                    </h3>
                    {isNewCustomer ? (
                        <span className="bg-blue-500/15 text-blue-300 border border-blue-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                    ) : (
                        <span className="bg-purple-500/15 text-purple-300 border border-purple-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded">RETURNING</span>
                    )}
                </div>
                <p className="text-xs text-latte/30 font-mono mt-0.5">{order.customers?.phone}</p>
            </div>

            {/* Order Items */}
            <div className="space-y-1 my-1">
                {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm font-medium text-latte/70 border-b border-dashed border-latte/8 last:border-0 pb-1 last:pb-0">
                        <span>{item.quantity}x {item.name}</span>
                    </div>
                ))}
            </div>

            {/* Footer: Type & Total */}
            <div className="flex justify-between items-center pt-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${order.order_type === 'dine-in' ? "bg-blue-500/10 text-blue-300" :
                    order.order_type === 'takeout' ? "bg-purple-500/10 text-purple-300" :
                        "bg-orange-500/10 text-orange-300"
                    }`}>
                    {order.order_type === 'dine-in' && <><Utensils size={12} /> T-{order.table_number}</>}
                    {order.order_type === 'takeout' && <><ShoppingBag size={12} /> Takeout</>}
                    {order.order_type === 'delivery' && <><Truck size={12} /> Delivery</>}
                    {(!order.order_type) && <><Truck size={12} /> Delivery</>} {/* Fallback for old orders */}
                </span>
                <span className="font-extrabold text-lg text-cream">৳{order.total_amount}</span>
            </div>

            {/* Action Button */}
            {!isCompleted && onAction && (
                <button
                    onClick={onAction}
                    className={`w-full py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 mt-2 cursor-pointer ${actionColor}`}
                >
                    {actionLabel}
                </button>
            )}
        </motion.div>
    );
}
