"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);

        if (error) throw new Error(error.message);

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update order:", error);
        return { success: false, error: error.message };
    }
}
