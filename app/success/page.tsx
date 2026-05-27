"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { CheckCircle, ArrowRight, Home, Send, Bell, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getSecureOrderForSuccess } from "@/app/actions/customerData";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("id");
    const eta = searchParams.get("eta") || "15-20";

    const [order, setOrder] = useState<any>(null);
    const [customer, setCustomer] = useState<any>(null);
    const [isSubscribingPush, setIsSubscribingPush] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // 1. Fetch Order and joined Customer data
    useEffect(() => {
        if (!orderId) {
            setIsLoadingData(false);
            return;
        }

        async function loadOrderDetails() {
            try {
                const res = await getSecureOrderForSuccess(orderId!);

                if (res.success && res.data) {
                    const data = res.data;
                    setOrder(data);
                    if (data.customers) {
                        setCustomer(data.customers);
                    }
                } else {
                    console.error("Failed to load secure order:", res.error);
                }
            } catch (err) {
                console.error("Error loading order:", err);
            } finally {
                setIsLoadingData(false);
            }
        }

        loadOrderDetails();
    }, [orderId]);

    // 2. Real-time listener for the customer row changes (detecting Chat ID or Push Sub saved in background)
    useEffect(() => {
        if (!customer?.id) return;

        const channel = supabase
            .channel(`customer_alerts_sync_${customer.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "customers",
                    filter: `id=eq.${customer.id}`
                },
                (payload) => {
                    console.log("Realtime customer update detected:", payload.new);
                    setCustomer(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [customer?.id]);

    // 3. Web Push subscription logic
    const enableWebPush = async () => {
        if (!customer?.id) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert("⚠️ Your browser or device doesn't support background push notifications.");
            return;
        }

        try {
            setIsSubscribingPush(true);

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert("🔔 Notification permission denied. Please allow notifications in your browser settings to get alerts!");
                setIsSubscribingPush(false);
                return;
            }

            // Register background Service Worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker active:', registration);

            // Subscribe using our public VAPID key
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                console.error('VAPID public key missing in client env');
                alert('⚠️ Configuration error: VAPID keys not found on frontend.');
                setIsSubscribingPush(false);
                return;
            }

            const urlBase64ToUint8Array = (base64String: string) => {
                const padding = '='.repeat((4 - base64String.length % 4) % 4);
                const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
                const rawData = window.atob(base64);
                const outputArray = new Uint8Array(rawData.length);
                for (let i = 0; i < rawData.length; ++i) {
                    outputArray[i] = rawData.charCodeAt(i);
                }
                return outputArray;
            };

            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            };

            const subscription = await registration.pushManager.subscribe(subscribeOptions);
            console.log('Generated PushSubscription:', subscription);

            // Save to database via API endpoint
            const res = await fetch('/api/web-push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: customer.id,
                    subscription: subscription
                })
            });

            const resData = await res.json();
            if (resData.success) {
                // Instantly update local state since DB updated
                setCustomer((prev: any) => ({ ...prev, web_push_subscription: subscription }));
            } else {
                console.error('API failed to save subscription:', resData.error);
                alert('⚠️ Failed to save notification token on the server.');
            }
        } catch (error) {
            console.error('Error in Web Push workflow:', error);
            alert('⚠️ Failed to initialize browser notifications. Please try again.');
        } finally {
            setIsSubscribingPush(false);
        }
    };

    // Hero title variants
    const pizzaVariants: Variants = {
        initial: { scale: 0.8, opacity: 0, rotate: -20 },
        animate: {
            scale: 1,
            opacity: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 18,
                duration: 1
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-center font-sans w-full max-w-2xl mx-auto">
            <motion.div
                initial="initial"
                animate="animate"
                variants={pizzaVariants}
                className="text-9xl mb-6 relative"
            >
                ☕
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -bottom-2 -right-2 bg-sage text-cream rounded-full p-2 border-4 border-cream-warm shadow-glow-sage"
                >
                    <CheckCircle size={48} />
                </motion.div>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold font-heading text-espresso mb-4"
            >
                Order Received!
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-espresso/70 max-w-md mx-auto mb-8 font-sans"
            >
                Wonderful choice! The kitchen is preparing your meal with care.
            </motion.p>

            {/* Order Details Card */}
            {orderId && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-6 rounded-2xl shadow-aromatic-sm border border-latte/15 max-w-sm w-full mb-8 font-sans"
                >
                    <p className="text-[10px] font-bold text-espresso/40 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="text-2xl font-mono font-bold text-espresso">#{orderId.slice(0, 8)}</p>
                    <div className="h-px bg-latte/10 my-4" />
                    <p className="text-sm text-espresso font-medium">
                        Estimated Wait Time: <span className="text-sage font-bold">{eta} mins</span>
                    </p>
                </motion.div>
            )}

            {/* Choice Alert Notification Opt-In Panel */}
            {customer && !isLoadingData && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-cream-warm/65 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-latte/20 w-full mb-8 text-left shadow-aromatic-md"
                >
                    <h3 className="font-heading text-2xl font-bold text-espresso mb-2">
                        Get Notified Off-Browser! 📢
                    </h3>
                    <p className="text-sm text-espresso/60 mb-6 leading-relaxed">
                        Don&apos;t want to keep this browser tab open? Select how you want to be alerted the moment your food is fresh and ready:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Choice 1: Telegram Bot deep linking */}
                        <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                            customer.telegram_chat_id 
                                ? 'bg-sage/10 border-sage/30 text-sage-deep' 
                                : 'bg-white border-latte/15 hover:border-espresso/30'
                        }`}>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-heading font-bold text-lg text-espresso">Telegram Alerts</span>
                                    {customer.telegram_chat_id ? (
                                        <div className="bg-sage text-cream rounded-full p-1 shadow-glow-sage">
                                            <Check size={16} />
                                        </div>
                                    ) : (
                                        <div className="bg-blue-500/10 text-blue-600 rounded-full p-1.5">
                                            <Send size={16} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-espresso/50 mb-4 leading-normal">
                                    Free push alerts delivered straight to your phone via our dedicated bot. Highly recommended!
                                </p>
                            </div>

                            {customer.telegram_chat_id ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-sage">
                                    <CheckCircle size={14} /> Connected on Telegram!
                                </div>
                            ) : (
                                <a
                                    href={`https://t.me/Urban_cafe_bot?start=${customer.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-espresso text-cream font-bold text-xs rounded-xl hover:bg-espresso-deep active:scale-98 transition-all shadow-glow-espresso cursor-pointer"
                                >
                                    Subscribe on Telegram
                                </a>
                            )}
                        </div>

                        {/* Choice 2: Web Push API */}
                        <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                            customer.web_push_subscription 
                                ? 'bg-sage/10 border-sage/30 text-sage-deep' 
                                : 'bg-white border-latte/15 hover:border-espresso/30'
                        }`}>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-heading font-bold text-lg text-espresso">Browser Alerts</span>
                                    {customer.web_push_subscription ? (
                                        <div className="bg-sage text-cream rounded-full p-1 shadow-glow-sage">
                                            <Check size={16} />
                                        </div>
                                    ) : (
                                        <div className="bg-sage/10 text-sage rounded-full p-1.5">
                                            <Bell size={16} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-espresso/50 mb-4 leading-normal">
                                    Receive native system push notifications on your device. Works even when the tab is closed!
                                </p>
                            </div>

                            {customer.web_push_subscription ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-sage">
                                    <CheckCircle size={14} /> Web Push Enabled!
                                </div>
                            ) : (
                                <button
                                    onClick={enableWebPush}
                                    disabled={isSubscribingPush}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-sage text-cream font-bold text-xs rounded-xl hover:bg-sage-deep active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sage cursor-pointer"
                                >
                                    {isSubscribingPush ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Enabling...
                                        </>
                                    ) : (
                                        "Enable Browser Alerts"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Navigation Options */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4"
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-espresso font-bold rounded-xl border border-latte/20 hover:bg-cream-warm transition-all shadow-aromatic-xs hover:shadow-aromatic-sm cursor-pointer font-sans"
                >
                    <Home size={20} /> Back Home
                </Link>
                <Link
                    href="/profile"
                    className="flex items-center gap-2 px-6 py-3 bg-espresso text-cream font-bold rounded-xl hover:bg-espresso-deep transition-all shadow-glow-espresso active:scale-95 cursor-pointer font-heading"
                >
                    Track Order <ArrowRight size={20} />
                </Link>
            </motion.div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-warm-texture flex flex-col items-center justify-center p-6">
            <Suspense fallback={<div className="text-center font-bold text-espresso/60 animate-pulse font-heading">Loading order details...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
