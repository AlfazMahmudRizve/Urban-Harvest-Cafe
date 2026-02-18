"use client";

import { useEffect, useState } from "react";
import { getCustomerSession } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { User, Clock, ShoppingBag, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutCustomer } from "@/lib/auth";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
    const [customer, setCustomer] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [updatingPassword, setUpdatingPassword] = useState(false);

    useEffect(() => {
        async function loadData() {
            const session = await getCustomerSession();
            if (!session) {
                router.push("/login");
                return;
            }

            if (session.requiresPasswordChange) {
                setShowPasswordReset(true);
            }

            // Fetch fresh customer data
            const { data: customerData } = await supabase
                .from("customers")
                .select("*")
                .eq("id", session.id)
                .single();

            setCustomer(customerData);

            // Fetch orders
            const { data: ordersData } = await supabase
                .from("orders")
                .select("*")
                .eq("customer_id", session.id)
                .order("created_at", { ascending: false });

            if (ordersData) setOrders(ordersData);
            setLoading(false);
        }
        loadData();
    }, [router]);

    async function handleLogout() {
        await logoutCustomer();
        router.push("/");
    }

    const [successMessage, setSuccessMessage] = useState("");

    async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setUpdatingPassword(true);
        setPasswordError("");
        setSuccessMessage("");

        const formData = new FormData(e.currentTarget);
        const newPassword = formData.get("newPassword") as string;

        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            setUpdatingPassword(false);
            return;
        }

        const { updateCustomerPassword } = await import("@/lib/auth");
        const result = await updateCustomerPassword(newPassword);

        if (result.success) {
            setSuccessMessage("Password updated successfully! Redirecting...");
            setTimeout(() => {
                setShowPasswordReset(false);
                setSuccessMessage("");
            }, 2000);
        } else {
            setPasswordError(result.error || "Failed to update password");
        }
        setUpdatingPassword(false);
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center font-sans">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-cream pb-20 font-sans">
            <div className="bg-espresso text-cream pb-20 pt-8 px-6">
                <div className="max-w-4xl mx-auto flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold font-heading">My Profile</h1>
                        <p className="opacity-80 font-sans">Welcome back, {customer?.name}!</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push("/")}
                            className="bg-cream text-espresso px-4 py-2 rounded-full font-bold shadow-lg hover:bg-white transition-all active:scale-95 flex items-center gap-2"
                        >
                            <ShoppingBag size={18} />
                            Order More
                        </button>
                        <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-colors text-white">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-12 space-y-8">
                {/* Stats */}
                <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border border-latte/10">
                    <div className="flex items-center gap-4">
                        <div className="bg-latte/20 p-4 rounded-full text-espresso">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Customer Info</p>
                            <p className="font-bold text-espresso">{customer?.phone}</p>
                            <p className="text-xs text-gray-400 truncate w-32">{customer?.address}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-sage/20 p-4 rounded-full text-sage">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Total Spend</p>
                            <p className="font-bold text-2xl text-espresso">৳{customer?.total_spend}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-50 p-4 rounded-full text-orange-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Total Visits</p>
                            <p className="font-bold text-2xl text-espresso">{customer?.visit_count}</p>
                        </div>
                    </div>
                </div>

                {/* Order History */}
                <div>
                    <h2 className="text-xl font-bold text-espresso mb-4 font-heading">Order History</h2>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-latte/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${order.status === 'completed' ? 'bg-sage/10 text-sage' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-600">
                                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-espresso">৳{order.total_amount}</div>
                                    <button onClick={() => router.push(`/success?id=${order.id}`)} className="text-xs font-bold text-sage hover:underline mt-1 font-sans">
                                        View Receipt
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Password Reset Modal */}
            {showPasswordReset && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User size={32} className="text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-espresso font-heading">Set Your Password</h2>
                            <p className="text-gray-500 mt-2 text-sm">
                                You are currently using a temporary password. Please set a secure password to protect your account.
                            </p>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-espresso/50 uppercase mb-1">New Password</label>
                                <input
                                    name="newPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full p-3 bg-cream rounded-xl border border-latte/20 outline-none focus:ring-2 focus:ring-espresso font-bold text-espresso"
                                    placeholder="••••••••"
                                />
                            </div>

                            {passwordError && <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">{passwordError}</div>}
                            {successMessage && <div className="text-green-600 text-sm font-bold text-center bg-green-50 p-2 rounded-lg animate-pulse">{successMessage}</div>}

                            <button
                                type="submit"
                                disabled={updatingPassword}
                                className="w-full bg-espresso text-cream font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-espresso/90 transition-all active:scale-95 flex justify-center items-center gap-2"
                            >
                                {updatingPassword ? "Updating..." : "Save Password"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
