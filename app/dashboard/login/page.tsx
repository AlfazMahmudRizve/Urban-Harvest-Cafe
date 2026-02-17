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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="font-heading font-extrabold text-3xl text-gray-900">Admin Access 🔒</h1>
                    <p className="text-gray-500 mt-2">Enter credentials to access the command center</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-metro outline-none transition-all"
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-metro outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-metro text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-700 transition-all active:scale-95 flex justify-center items-center"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Unlock Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}
