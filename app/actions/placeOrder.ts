"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client (Service Role for Admin Write Access if needed, or Public for now with RLS)
// Ideally for server actions writing to multiple tables, Service Role is safer to bypass RLS if user isn't auth'd.
// But we'll try with standard anon key first if RLS allows, or use the service role if available.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Validation Schema
const OrderSchema = z.object({
    customer: z.object({
        name: z.string().min(1, "Name is required"),
        phone: z.string().min(11, "Phone must be at least 11 digits"),
        address: z.string().optional(),
        tableNumber: z.string().optional(),
        orderType: z.enum(['dine-in', 'takeout', 'delivery']),
    }).refine((data) => {
        if (data.orderType === 'dine-in' && !data.tableNumber) return false;
        if (data.orderType === 'delivery' && !data.address) return false;
        return true;
    }, {
        message: "Table Number is required for Dine-in, Address is required for Delivery",
        path: ["tableNumber"], // simplistic error path
    }),
    cart: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number().min(1),
    })).min(1, "Cart cannot be empty"),
    total: z.number().min(0),
});

export async function placeOrder(prevState: any, formData: any) {
    // 1. Validate Input
    const validatedFields = OrderSchema.safeParse(formData);

    if (!validatedFields.success) {
        return { success: false, error: validatedFields.error.flatten().fieldErrors };
    }

    const { customer, cart, total } = validatedFields.data;

    // 2. Validate Store Status (Respect Manual Override)
    const { getStoreStatus } = await import("./storeStatus");
    const status = await getStoreStatus();

    if (!status.isOpen) {
        return { success: false, error: "Store is currently closed. Please check back later!" };
    }

    try {
        // 2. Upsert Customer (Track spend)
        // Check if customer exists by phone
        const { data: existingCustomer, error: fetchError } = await supabase
            .from("customers")
            .select("id, total_spend, visit_count")
            .eq("phone", customer.phone)
            .single();

        let customerId;

        if (existingCustomer) {
            // Update existing
            const { error: updateError } = await supabase
                .from("customers")
                .update({
                    name: customer.name, // Update name just in case
                    address: customer.address || "", // Update address
                    total_spend: (existingCustomer.total_spend || 0) + total,
                    visit_count: (existingCustomer.visit_count || 0) + 1,
                    last_order: new Date().toISOString(),
                })
                .eq("id", existingCustomer.id);

            if (updateError) throw new Error("Failed to update customer: " + updateError.message);
            customerId = existingCustomer.id;
        } else {
            // Insert new
            const hashedPassword = await require("bcryptjs").hash("1234", 10);

            const { data: newCustomer, error: insertError } = await supabase
                .from("customers")
                .insert({
                    name: customer.name,
                    phone: customer.phone,
                    address: customer.address || "",
                    password: hashedPassword, // Set default password
                    total_spend: total,
                    visit_count: 1,
                    last_order: new Date().toISOString(),
                })
                .select("id")
                .single();

            if (insertError) throw new Error("Failed to create customer: " + insertError.message);
            customerId = newCustomer.id;
        }

        // 3. Insert Order
        const { data, error: orderError } = await supabase
            .from("orders")
            .insert({
                customer_id: customerId,
                items: cart, // Storing JSONB
                total_amount: total,
                status: "pending", // Default status
                delivery_address: customer.address,
                table_number: customer.orderType === 'dine-in' ? customer.tableNumber : null,
                order_type: customer.orderType
            })
            .select("id")
            .single();

        if (orderError) throw new Error("Failed to place order: " + orderError.message);

        const orderId = data?.id;

        // 4. Send Telegram Notification
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            const itemsList = cart.map(i => `- ${i.quantity}x ${i.name}`).join("\n");
            const message = `
🔥 *New Order Received!*

👤 *Customer*: ${customer.name}
📞 *Phone*: ${customer.phone}
🚀 *Type*: ${customer.orderType.toUpperCase()}
${customer.orderType === 'dine-in' ? `🍽 *Table*: ${customer.tableNumber}` : ''}
${customer.orderType === 'delivery' ? `🚚 *Address*: ${customer.address}` : ''}

🛒 *Items*:
${itemsList}

💰 *Total*: ৳${total}
            `.trim();

            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: "Markdown",
                }),
            });
        }

        return { success: true, orderId: orderId };

    } catch (error: any) {
        console.error("Order processing failed:", error);
        return { success: false, error: error.message || "Failed to place order" };
    }
}
