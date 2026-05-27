"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);

        // We import dynamically to avoid server-action-in-client-component issues during build if mismatched
        // But standard nextjs allows importing server actions directly.
        const { loginAdmin } = await import("@/lib/auth");

        const result = await loginAdmin(formData);

        if (result.success) {
            router.push("/dashboard");
        } else {
            setError(result.error || "Login failed");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dash p-4 grain-overlay">
            <div className="glass-card-dark p-8 rounded-2xl border border-latte/15 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <h1 className="font-heading font-extrabold text-3xl text-espresso flex items-center justify-center gap-2">Admin Access <span>🔒</span></h1>
                    <p className="text-espresso/60 mt-2 font-medium">Enter credentials to access the kitchen workspace</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-espresso/70 mb-2">Username</label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full p-3 bg-white border border-latte/20 text-espresso rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all font-sans"
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-espresso/70 mb-2">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full p-3 bg-white border border-latte/20 text-espresso rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent outline-none transition-all font-sans"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-sage hover:bg-sage/90 text-cream font-bold py-4 rounded-xl shadow-glow-sage transition-all active:scale-95 flex justify-center items-center btn-glow cursor-pointer"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Unlock Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}
