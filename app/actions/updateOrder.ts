"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import webpush from "web-push";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Set up browser Web Push credentials
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:admin@whoisalfaz.me',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        // 1. Fetch current order with customer details to check notification preference
        const { data: order, error: orderFetchError } = await supabase
            .from("orders")
            .select("*, customers(*)")
            .eq("id", orderId)
            .single();

        if (orderFetchError) {
            console.error("Error fetching order for notification:", orderFetchError.message);
        }

        // 2. Perform the actual database status update
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);

        if (error) throw new Error(error.message);

        // 3. Trigger Notification Dispatcher if status becomes 'completed' (Ready)
        if (newStatus === "completed" && order) {
            const customer = order.customers;
            const preference = order.notification_preference || "none";
            console.log(`Order ${orderId} marked as completed. Notification preference: ${preference}`);

            if (customer) {
                const customerName = customer.name;
                const itemsList = order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ");
                const location = order.delivery_address || (order.table_number ? `Table ${order.table_number}` : "Takeout");

                // Dispatch Option A: Telegram Alert
                if (preference === "telegram" && customer.telegram_chat_id) {
                    const botToken = process.env.TELEGRAM_BOT_TOKEN;
                    if (botToken) {
                        const message = `☕ *Your order is hot and ready, ${customerName}!* \n\n🛒 *Items:* ${itemsList}\n📍 *Collection:* ${location}\n\nThank you for dining at Urban Harvest! Enjoy your fresh meal! 🔥🥯`;
                        
                        try {
                            const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    chat_id: customer.telegram_chat_id,
                                    text: message,
                                    parse_mode: 'Markdown'
                                })
                            });
                            console.log(`Telegram dispatch result status: ${tgRes.status}`);
                        } catch (err) {
                            console.error("Failed to dispatch Telegram message:", err);
                        }
                    } else {
                        console.warn("TELEGRAM_BOT_TOKEN missing from backend environment.");
                    }
                } 
                // Dispatch Option B: Browser Web Push
                else if (preference === "web-push" && customer.web_push_subscription) {
                    try {
                        console.log(`Sending Web Push notification to client for order ${orderId}`);
                        await webpush.sendNotification(
                            customer.web_push_subscription,
                            JSON.stringify({
                                title: '☕ Your Order is Ready!',
                                body: `Hi ${customerName}, your items (${itemsList}) are fresh and ready for pickup!`,
                                url: `/success?id=${orderId}`
                            })
                        );
                        console.log("Web Push notification successfully sent.");
                    } catch (err) {
                        console.error("Failed to dispatch Web Push notification:", err);
                    }
                }
            }
        }

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update order:", error);
        return { success: false, error: error.message };
    }
}
