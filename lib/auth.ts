"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secretKey = "secret-key-change-me-in-production"; // In real app, stick this in env
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch {
        return null;
    }
}

// ADMIN AUTH
export async function loginAdmin(formData: FormData) {
    // Use fixed credentials or env vars
    const username = formData.get("username");
    const password = formData.get("password");

    // Simple hardcoded check for MVP as requested
    if (username === "admin" && password === "admin123") { // Replace with env in prod
        const user = { username: "admin", role: "admin" };

        // Create the session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const session = await encrypt({ user, expires });

        // Save the session in a cookie
        cookies().set("admin_session", session, { expires, httpOnly: true });
        return { success: true };
    }

    return { success: false, error: "Invalid credentials" };
}

export async function logoutAdmin() {
    cookies().set("admin_session", "", { expires: new Date(0) });
}

export async function getAdminSession() {
    const session = cookies().get("admin_session")?.value;
    if (!session) return null;
    return await decrypt(session);
}

// CUSTOMER AUTH
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function registerCustomer(formData: FormData) {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const password = formData.get("password") as string;

    if (!name || !phone || !password) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        // Check if phone exists
        const { data: existing } = await supabase.from("customers").select("id").eq("phone", phone).single();
        if (existing) {
            return { success: false, error: "Phone number already registered" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert
        const { data, error } = await supabase.from("customers").insert({
            name,
            phone,
            address,
            password: hashedPassword,
            visit_count: 1,
            total_spend: 0
        }).select().single();

        if (error) throw error;

        // Create Session
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const session = await encrypt({
            id: data.id,
            phone: data.phone,
            name: data.name,
            role: "customer",
            expires
        });

        cookies().set("customer_session", session, { expires, httpOnly: true });

        return { success: true };

    } catch (error: any) {
        console.error("Registration error:", error);
        return { success: false, error: error.message || "Registration failed" };
    }
}

export async function loginCustomer(formData: FormData) {
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    // Check for Admin Login
    if (phone === "admin") {
        const adminFormData = new FormData();
        adminFormData.append("username", phone);
        adminFormData.append("password", password);

        const adminResult = await loginAdmin(adminFormData);
        if (adminResult.success) {
            return { success: true, redirect: "/dashboard" };
        } else {
            return { success: false, error: "Invalid admin credentials" };
        }
    }

    try {
        // Fetch user
        const { data: customer, error } = await supabase
            .from("customers")
            .select("*")
            .eq("phone", phone)
            .single();

        if (error || !customer) {
            return { success: false, error: "Invalid credentials" };
        }

        // Check password
        let match = false;
        if (customer.password) {
            match = await bcrypt.compare(password, customer.password);
        } else if (password === "1234") {
            // Legacy Guest Migration: Allow 1234 if no password set, and update DB
            const hashedPassword = await bcrypt.hash("1234", 10);
            await supabase.from("customers").update({ password: hashedPassword }).eq("id", customer.id);
            match = true;
        }

        if (!match) {
            return { success: false, error: "Invalid credentials" };
        }

        // Create Session
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const session = await encrypt({
            id: customer.id,
            phone: customer.phone,
            name: customer.name,
            role: "customer",
            requiresPasswordChange: password === "1234",
            expires
        });

        cookies().set("customer_session", session, { expires, httpOnly: true });

        if (password === "1234") {
            return { success: true, redirect: "/profile" };
        }

        return { success: true };

    } catch (error: any) {
        console.error("Login error:", error);
        return { success: false, error: "Login failed" };
    }
}

export async function getCustomerSession() {
    const session = cookies().get("customer_session")?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function logoutCustomer() {
    cookies().set("customer_session", "", { expires: new Date(0) });
}

export async function updateCustomerPassword(newPassword: string) {
    const session = await getCustomerSession();
    if (!session) return { success: false, error: "Not authenticated" };

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const { error } = await supabase
            .from("customers")
            .update({ password: hashedPassword })
            .eq("id", session.id);

        if (error) throw error;

        // Refresh session to clear flag
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const newSession = await encrypt({
            ...session,
            requiresPasswordChange: false,
            expires
        });
        cookies().set("customer_session", newSession, { expires, httpOnly: true });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
