"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { loginCustomer, registerCustomer } from "@/lib/auth";

export default function CustomerLogin() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);
        const action = isLogin ? loginCustomer : registerCustomer;

        try {
            const result = await action(formData);
            if (result.success) {
                router.push("/");
                router.refresh();
            } else {
                setError(result.error || "Authentication failed");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-plate p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 transition-all">
                <div className="text-center mb-6">
                    <h1 className="font-heading font-extrabold text-3xl text-gray-900">
                        {isLogin ? "Welcome Back! 👋" : "Join the Club 🚀"}
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        {isLogin ? "Login to access your loyalty perks" : "Register to start earning rewards"}
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-metro font-medium"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                        <input
                            name="phone"
                            type="tel"
                            required
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-metro font-medium"
                            placeholder="01712345678"
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                            <textarea
                                name="address"
                                required
                                rows={2}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-metro font-medium"
                                placeholder="House 10, Road 5..."
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-metro font-bold"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">{error}</div>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-metro text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-red-700 transition-all active:scale-95 flex justify-center items-center gap-2"
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
