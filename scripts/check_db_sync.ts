
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking Database Schema...");

    // 1. Check 'customers' table for 'password' column
    console.log("\n1. Checking 'customers' table...");
    const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("id, password")
        .limit(1);

    if (customersError) {
        console.error("❌ 'customers' table check failed:", customersError.message);
    } else {
        console.log("✅ 'customers' table accessed.");
        // If the select worked, the password column exists (or at least the query didn't explode instantly, 
        // though Supabase client might filter it out if it doesn't exist? postgrest usually errors on unknown column)
        console.log("   (If no error above, 'password' column likely exists)");
    }

    // 2. Check 'menu_items' table
    console.log("\n2. Checking 'menu_items' table...");
    const { data: menuData, error: menuError } = await supabase
        .from("menu_items")
        .select("*")
        .limit(1);

    if (menuError) {
        console.error("❌ 'menu_items' table check failed:", menuError.message);
    } else {
        console.log("✅ 'menu_items' table accessed. Count:", menuData?.length);
    }
}

checkSchema().catch(console.error);
