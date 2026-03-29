"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { isStoreOpen as checkSchedule, getNextScheduleChange } from "@/lib/utils/businessHours";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getStoreStatus() {
    let isOpen = false;
    let message = "";
    let isManual = false;
    let expiresAt: string | undefined = undefined;

    // 1. Fetch Store Settings (Override + Overload Config)
    const { data: settings } = await supabase
        .from("store_settings")
        .select("manual_status, override_expires_at, max_active_orders, base_prep_time, prep_time_per_order")
        .eq("id", 1)
        .single();

    // Configuration defaults in case they haven't been set
    const maxActiveOrders = settings?.max_active_orders || 15;
    const basePrepTime = settings?.base_prep_time || 10;
    const prepTimePerOrder = settings?.prep_time_per_order || 3;

    if (settings && settings.manual_status && settings.override_expires_at) {
        const overrideExpiresAt = new Date(settings.override_expires_at);
        if (overrideExpiresAt > new Date()) {
            isOpen = settings.manual_status === "OPEN";
            message = isOpen
                ? `Store is Manually OPEN until ${overrideExpiresAt.toLocaleTimeString([], {timeStyle: 'short'})}`
                : `Store is Manually CLOSED until ${overrideExpiresAt.toLocaleTimeString([], {timeStyle: 'short'})}`;
            isManual = true;
            expiresAt = settings.override_expires_at;
        }
    }

    // 2. Fallback to Regular Schedule
    if (!isManual) {
        const status = checkSchedule();
        isOpen = status.isOpen;
        message = status.message;
    }

    // 3. Dynamic Overload Protection & Prep Time
    const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'preparing']);

    const activeOrders = count || 0;
    
    // Calculate dynamic wait time
    const estimatedPrepTime = Math.min(basePrepTime + (activeOrders * prepTimePerOrder), maxActiveOrders * prepTimePerOrder * 1.5); 

    if (isOpen && activeOrders >= maxActiveOrders) {
        isOpen = false;
        // Tell user it's overloaded
        message = `Kitchen is currently overwhelmed. Please try again in ${estimatedPrepTime} minutes.`;
    }

    return { 
        isOpen, 
        message, 
        isManual, 
        expiresAt,
        estimatedPrepTime,
        activeOrders
    };
}

export async function toggleStoreStatus(forceStatus: "OPEN" | "CLOSED" | null) {
    if (forceStatus === null) {
        // Clear override
        await supabase
            .from("store_settings")
            .update({ manual_status: null, override_expires_at: null })
            .eq("id", 1);
    } else {
        // Create override until next schedule change
        const nextChange = getNextScheduleChange();

        await supabase
            .from("store_settings")
            .update({
                manual_status: forceStatus,
                override_expires_at: nextChange.toISOString()
            })
            .eq("id", 1);
    }

    revalidatePath("/dashboard");
    revalidatePath("/"); // Update homepage/cart check
    return { success: true };
}
