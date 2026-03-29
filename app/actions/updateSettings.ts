"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getDashboardSettings() {
    const { data } = await supabase
        .from("store_settings")
        .select("max_active_orders, base_prep_time, prep_time_per_order")
        .eq("id", 1)
        .single();
    
    return data || {
        max_active_orders: 15,
        base_prep_time: 10,
        prep_time_per_order: 3
    };
}

export async function updateDashboardSettings(formData: {
    max_active_orders: number;
    base_prep_time: number;
    prep_time_per_order: number;
}) {
    try {
        const { error } = await supabase
            .from("store_settings")
            .update(formData)
            .eq("id", 1);

        if (error) throw new Error(error.message);

        revalidatePath("/dashboard");
        revalidatePath("/"); // Update cart check
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update settings:", error);
        return { success: false, error: error.message };
    }
}
