"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { loginCustomer, registerCustomer } from "@/lib/auth";
import { motion } from "framer-motion";

export default function CustomerLogin() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showGuestHint, setShowGuestHint] = useState(false);
    const router = useRouter();

    const handlePhoneBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        if (!isLogin) return; // Only check on login
        const phone = e.target.value;
        if (phone.length >= 11) {
            const { checkPhoneExists } = await import("@/app/actions/checkUser");
            const { exists } = await checkPhoneExists(phone);
            if (exists) {
                setShowGuestHint(true);
            } else {
                setShowGuestHint(false);
            }
        }
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);
        const action = isLogin ? loginCustomer : registerCustomer;

        try {
            const result: { success: boolean; error?: string; redirect?: string } = await action(formData);
            if (result.success) {
                if (result.redirect) {
                    router.push(result.redirect);
                } else {
                    router.push("/");
                }
                router.refresh();
            } else {
                setError(result.error || "Authentication failed");
            }
        } catch (err: any) {
            console.error("Unexpected Error in Login Page:", err);
            setError("An unexpected error occurred: " + (err.message || String(err)));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-latte/20 transition-all font-sans">
                <div className="text-center mb-6">
                    <h1 className="font-heading font-bold text-3xl text-espresso">
                        {isLogin ? "Welcome Back! ☕" : "Join the Family 🥐"}
                    </h1>
                    <p className="text-espresso/60 mt-2 text-sm">
                        {isLogin ? "Login to access your cafe rewards" : "Register to start earning points"}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex bg-cream p-1 rounded-xl mb-6 border border-latte/10">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? "bg-white shadow-sm text-espresso" : "text-espresso/50 hover:text-espresso"}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? "bg-white shadow-sm text-espresso" : "text-espresso/50 hover:text-espresso"}`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-espresso/50 uppercase mb-1">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full p-3 bg-cream rounded-xl border border-latte/20 outline-none focus:ring-2 focus:ring-espresso font-medium text-espresso"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-espresso/50 uppercase mb-1">Mobile Number / Username</label>
                        <input
                            name="phone"
                            type="text" // changed from tel to text to allow 'admin'
                            required
                            className="w-full p-3 bg-cream rounded-xl border border-latte/20 outline-none focus:ring-2 focus:ring-espresso font-medium text-espresso"
                            placeholder="01712345678"
                            onBlur={handlePhoneBlur}
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-espresso/50 uppercase mb-1">Address</label>
                            <textarea
                                name="address"
                                required
                                rows={2}
                                className="w-full p-3 bg-cream rounded-xl border border-latte/20 outline-none focus:ring-2 focus:ring-espresso font-medium text-espresso"
                                placeholder="House 10, Road 5..."
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-espresso/50 uppercase mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full p-3 bg-cream rounded-xl border border-latte/20 outline-none focus:ring-2 focus:ring-espresso font-bold text-espresso"
                            placeholder="••••••••"
                        />
                        {/* Guest Hint */}
                        {isLogin && showGuestHint && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-sage font-bold mt-2 bg-sage/10 p-2 rounded-lg border border-sage/20 flex items-center gap-2"
                            >
                                💡 Already ordered before? Try pass <code className="bg-white px-1 rounded border border-sage/30">1234</code>
                            </motion.div>
                        )}
                    </div>

                    {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">{error}</div>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-espresso text-cream font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-espresso/90 transition-all active:scale-95 flex justify-center items-center gap-2 font-heading tracking-wide"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (
                            isLogin ? <>Login <LogIn size={20} /></> : <>Create Account <UserPlus size={20} /></>
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                    By continuing, you agree to our Terms & Privacy Policy.
                </p>
            </div>
        </div>
    );
}
