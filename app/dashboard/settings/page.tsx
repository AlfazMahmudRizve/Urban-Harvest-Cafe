"use client";

import { useEffect, useState } from "react";
import { Settings2, Save, AlertCircle } from "lucide-react";

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        max_active_orders: 15,
        base_prep_time: 10,
        prep_time_per_order: 3
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{type: 'success' | 'error', msg: string} | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            const { getDashboardSettings } = await import("@/app/actions/updateSettings");
            const data = await getDashboardSettings();
            setFormData({
                max_active_orders: data.max_active_orders || 15,
                base_prep_time: data.base_prep_time || 10,
                prep_time_per_order: data.prep_time_per_order || 3
            });
            setIsLoading(false);
        };
        fetchConfig();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setNotification(null);

        try {
            const { updateDashboardSettings } = await import("@/app/actions/updateSettings");
            const result = await updateDashboardSettings(formData);
            
            if (result.success) {
                setNotification({ type: 'success', msg: 'System configurations saved securely!' });
            } else {
                setNotification({ type: 'error', msg: result.error || 'Failed to sync settings' });
            }
        } catch (error) {
            setNotification({ type: 'error', msg: 'An unexpected error occurred.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-6 md:p-12 text-slate-500 font-medium">Loading workspace settings...</div>;
    }

    return (
        <div className="p-4 md:p-6 max-w-2xl animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-sage/20 text-sage p-2.5 rounded-xl border border-sage/10 shadow-md">
                    <Settings2 size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold font-heading text-cream tracking-tight">System Settings</h1>
                    <p className="text-sm font-medium text-latte/60">Fine-tune the preparation timings and capacity of the kitchen.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-dash-surface rounded-2xl border border-latte/8 overflow-hidden relative shadow-lg">
                <div className="p-6 border-b border-latte/8">
                    <h2 className="text-sm font-bold tracking-wider text-latte/40 uppercase mb-6 flex items-center gap-2">
                        <AlertCircle size={16} /> Kitchen Capacity Settings
                    </h2>
                    
                    <div className="space-y-6">
                        {/* Max Orders */}
                        <div>
                            <label className="flex items-center justify-between font-bold text-cream tracking-tight text-sm mb-1">
                                Active Order Threshold
                                <span className="text-xs font-semibold text-latte/40 bg-dash-bg px-2 py-0.5 rounded-full border border-latte/8">Active Orders</span>
                            </label>
                            <p className="text-xs text-latte/50 mb-2 font-medium">
                                The maximum number of active (pending/preparing) orders before the storefront auto-pauses checkout.
                            </p>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                required
                                value={formData.max_active_orders}
                                onChange={(e) => setFormData({ ...formData, max_active_orders: parseInt(e.target.value) })}
                                className="w-full md:w-1/2 bg-dash-bg border border-latte/8 text-cream text-sm rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent block p-3 outline-none font-mono transition-shadow duration-200"
                            />
                        </div>

                        {/* Base Prep */}
                        <div>
                            <label className="flex items-center justify-between font-bold text-cream tracking-tight text-sm mb-1">
                                Base Preparation Time 
                                <span className="text-xs font-semibold text-latte/40 bg-dash-bg px-2 py-0.5 rounded-full border border-latte/8">Minutes</span>
                            </label>
                            <p className="text-xs text-latte/50 mb-2 font-medium">
                                Minimum guaranteed time an order takes when the kitchen is empty.
                            </p>
                            <input
                                type="number"
                                min="1"
                                required
                                value={formData.base_prep_time}
                                onChange={(e) => setFormData({ ...formData, base_prep_time: parseInt(e.target.value) })}
                                className="w-full md:w-1/2 bg-dash-bg border border-latte/8 text-cream text-sm rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent block p-3 outline-none font-mono transition-shadow duration-200"
                            />
                        </div>

                        {/* Per Order Multiplier */}
                        <div>
                            <label className="flex items-center justify-between font-bold text-cream tracking-tight text-sm mb-1">
                                Time Penalty Per Active Order
                                <span className="text-xs font-semibold text-latte/40 bg-dash-bg px-2 py-0.5 rounded-full border border-latte/8">Minutes</span>
                            </label>
                            <p className="text-xs text-latte/50 mb-2 font-medium">
                                Calculates dynamic ETA. (e.g. Base Time + (Penalty × Active Orders)).
                            </p>
                            <input
                                type="number"
                                min="1"
                                required
                                value={formData.prep_time_per_order}
                                onChange={(e) => setFormData({ ...formData, prep_time_per_order: parseInt(e.target.value) })}
                                className="w-full md:w-1/2 bg-dash-bg border border-latte/8 text-cream text-sm rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent block p-3 outline-none font-mono transition-shadow duration-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-dash-surface-hover/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-latte/8">
                    <div className="flex-1">
                        {notification && (
                            <div className={`text-sm font-bold flex items-center gap-2 ${notification.type === 'success' ? 'text-sage' : 'text-red-400'}`}>
                                <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-sage animate-pulse' : 'bg-red-500'}`} />
                                {notification.msg}
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-sage hover:bg-sage/90 text-cream font-bold py-2.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-glow-sage transition-all duration-200 active:scale-95 disabled:opacity-50 btn-glow cursor-pointer"
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-pulse flex items-center gap-2">
                                    <Save size={16} /> Syncing...
                                </span>
                            </>
                        ) : (
                            <>
                                <Save size={16} /> Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
