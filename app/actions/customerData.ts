"use server";

import { createClient } from "@supabase/supabase-js";
import { getCustomerSession, getAdminSession } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️ SECURITY WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined on the server. Falling back to public anonymous key. Ensure it is configured in production to safely bypass Row Level Security.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    }
});

export async function getSecureCustomerProfile() {
    try {
        const session = await getCustomerSession();
        if (!session) return { success: false, error: "Not authenticated" };

        const { data, error } = await supabase
            .from("customers")
            .select("id, name, phone, address, total_spend, visit_count, last_order")
            .eq("id", session.id)
            .single();

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to fetch secure profile:", error);
        return { success: false, error: error.message };
    }
}

export async function getSecureCustomerOrders() {
    try {
        const session = await getCustomerSession();
        if (!session) return { success: false, error: "Not authenticated" };

        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("customer_id", session.id)
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to fetch secure orders:", error);
        return { success: false, error: error.message };
    }
}

export async function getSecureOrderUpdates() {
    try {
        const session = await getCustomerSession();
        if (!session) return { success: false, error: "Not authenticated" };

        const { data, error } = await supabase
            .from("orders")
            .select("id, status, table_number")
            .eq("customer_id", session.id)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(5);

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to fetch secure order updates:", error);
        return { success: false, error: error.message };
    }
}

export async function getSecureKitchenOrders() {
    try {
        const session = await getAdminSession();
        if (!session || session.user?.role !== "admin") {
            return { success: false, error: "Not authenticated as administrator" };
        }

        const { data, error } = await supabase
            .from("orders")
            .select("*, customers(name, phone, visit_count, total_spend)")
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to fetch secure kitchen orders:", error);
        return { success: false, error: error.message };
    }
}

export async function getSecureKitchenCustomers() {
    try {
        const session = await getAdminSession();
        if (!session || session.user?.role !== "admin") {
            return { success: false, error: "Not authenticated as administrator" };
        }

        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order("total_spend", { ascending: false })
            .limit(50);

        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to fetch secure kitchen customers:", error);
        return { success: false, error: error.message };
    }
}
