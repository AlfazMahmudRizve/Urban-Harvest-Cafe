"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";

export default function CartSheet() {
    const { cart, getCartTotal, isStudentDiscountActive, clearCart, updateQuantity, removeFromCart } = useCartStore();
    const [isOpen, setIsOpen] = useState(false);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", tableNumber: "", address: "" });
    const [orderType, setOrderType] = useState<'dine-in' | 'takeout' | 'delivery'>('dine-in');
    const router = useRouter();

    // Hydration Fix
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        // Auto-fill from session
        const fetchSession = async () => {
            const { getCustomerSession } = await import("@/lib/auth");
            const session = await getCustomerSession();
            if (session) {
                setFormData(prev => ({ ...prev, phone: session.phone }));
            }
        };
        fetchSession();
    }, []);

    const total = getCartTotal();
    const discountActive = isStudentDiscountActive();
    const finalTotal = discountActive ? Math.round(total * 0.85) : total;
    const threshold = 1000;
    const remaining = Math.max(0, threshold - total);
    const progress = Math.min(100, (total / threshold) * 100);



    const [error, setError] = useState("");

    // Reset error when sheet opens/closes or checkout form toggles
    useEffect(() => {
        if (!isOpen || !showCheckoutForm) setError("");
    }, [isOpen, showCheckoutForm]);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Server-side check
        const { getStoreStatus } = await import("@/app/actions/storeStatus");
        const status = await getStoreStatus();

        if (!status.isOpen) {
            setError(status.message);
            return;
        }

        setIsSubmitting(true);

        try {
            // Import dynamically or pass as prop if needed, but for now calling the server action
            const { placeOrder } = await import("@/app/actions/placeOrder");

            const result = await placeOrder(null, {
                cart,
                customer: { ...formData, orderType },
                total: finalTotal
            });

            if (result.success) {
                clearCart();
                setIsOpen(false);
                setShowCheckoutForm(false);
                router.push(`/success?id=${result.orderId}`);
            } else {
                setError("Failed to place order: " + (result.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Checkout failed", error);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return (
        <>
            <AnimatePresence>
                {(!isOpen && mounted) && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-4 md:right-8 z-[9999] cursor-pointer"
                        onClick={() => setIsOpen(true)}
                    >
                        <div className="bg-espresso text-cream p-4 rounded-full shadow-2xl border-4 border-cream flex items-center gap-3 hover:scale-110 transition-transform">
                            <div className="relative">
                                <ShoppingBag size={24} />
                                <span className="absolute -top-2 -right-2 bg-latte text-espresso text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-espresso">
                                    {cart.length}
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <p className="font-bold text-sm font-sans">View Tray</p>
                                <p className="text-xs font-medium font-mono">৳{total}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expanded Sheet */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-espresso/20 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-cream w-full md:max-w-md md:rounded-3xl rounded-t-3xl h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 bg-white border-b border-latte/20 flex justify-between items-center">
                                <h2 className="font-heading font-bold text-2xl text-espresso">
                                    {showCheckoutForm ? "Checkout" : "Your Serving Tray"}
                                </h2>
                                <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} className="text-espresso" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {!showCheckoutForm ? (
                                    cart.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-latte/10">
                                            <div className="flex gap-4 items-center flex-1">
                                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm md:text-base text-espresso">{item.name}</h4>
                                                    <p className="text-xs text-gray-500 mb-2">৳{item.price} x {item.quantity}</p>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3 bg-gray-50 w-max px-2 py-1 rounded-lg border border-gray-100">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-espresso font-bold hover:bg-gray-50"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-bold text-sm w-4 text-center text-espresso">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-sage font-bold hover:bg-gray-50"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 ml-4">
                                                <div className="font-bold text-espresso">৳{item.price * item.quantity}</div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                                        {/* Order Type Selector */}
                                        <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
                                            {(['dine-in', 'takeout', 'delivery'] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setOrderType(type)}
                                                    className={cn(
                                                        "py-2 rounded-lg text-xs md:text-sm font-bold capitalize transition-all",
                                                        orderType === type
                                                            ? "bg-white text-espresso shadow-sm"
                                                            : "text-gray-500 hover:text-espresso"
                                                    )}
                                                >
                                                    {type.replace("-", " ")}
                                                </button>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-espresso mb-1">Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Your Name"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-espresso focus:border-transparent outline-none bg-gray-50"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-espresso mb-1">Phone</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="017..."
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-espresso focus:border-transparent outline-none bg-gray-50"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>

                                        {orderType === 'dine-in' && (
                                            <div className="animate-in fade-in slide-in-from-top-1">
                                                <label className="block text-sm font-bold text-espresso mb-1">Table No</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="05"
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-espresso focus:border-transparent outline-none bg-gray-50"
                                                    value={formData.tableNumber}
                                                    onChange={e => setFormData({ ...formData, tableNumber: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        {orderType === 'delivery' && (
                                            <div className="animate-in fade-in slide-in-from-top-1">
                                                <label className="block text-sm font-bold text-espresso mb-1">Address</label>
                                                <textarea
                                                    required
                                                    placeholder="House 12, Road 5..."
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-espresso focus:border-transparent outline-none bg-gray-50"
                                                    value={formData.address}
                                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>

                            <div className="p-6 bg-white border-t border-latte/20">
                                {!showCheckoutForm ? (
                                    <>
                                        {error && (
                                            <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl mb-4 text-center border border-red-100 animate-in fade-in slide-in-from-top-2">
                                                {error}
                                            </div>
                                        )}
                                        <div className="flex justify-between mb-4 text-lg text-espresso">
                                            <span>Total</span>
                                            <span className="font-bold">৳{total}</span>
                                        </div>
                                        {discountActive && (
                                            <div className="flex justify-between mb-4 text-sage font-bold">
                                                <span>Loyalty Discount (15%)</span>
                                                <span>-৳{Math.round(total * 0.15)}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setShowCheckoutForm(true)}
                                            className="w-full bg-espresso text-cream py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-espresso/90 transition-colors font-heading"
                                        >
                                            Proceed to Checkout
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {error && (
                                            <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl text-center border border-red-100 animate-in fade-in slide-in-from-top-2">
                                                {error}
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowCheckoutForm(false)}
                                                className="flex-1 bg-gray-100 text-espresso py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                form="checkout-form"
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 bg-espresso text-cream py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 hover:bg-espresso/90 transition-colors"
                                            >
                                                {isSubmitting ? "Placing Order..." : `Confirm ৳${finalTotal}`}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
