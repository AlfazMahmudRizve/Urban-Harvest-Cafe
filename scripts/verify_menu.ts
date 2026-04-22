
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMenu() {
    console.log("Connecting to Supabase...");
    const { data, error } = await supabase.from("menu_items").select("*");

    if (error) {
        console.error("Error fetching menu:", error.message);
    } else {
        console.log(`Successfully fetched ${data.length} menu items from Supabase!`);
        data.forEach(item => {
            console.log(`- ${item.name} (${item.price} TK) [${item.category}]`);
        });
    }
}

checkMenu();
