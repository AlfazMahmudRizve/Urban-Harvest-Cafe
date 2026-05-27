const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking columns on 'customers' table...");
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("id, name")
    .limit(1);

  if (customerError) {
    console.log("❌ Customers read error:", customerError.message);
  } else {
    console.log("✅ Customers accessible!");
    
    // Test if specific notification columns exist
    const { data: colData, error: colError } = await supabase
      .from("customers")
      .select("telegram_chat_id, web_push_subscription")
      .limit(1);
      
    if (colError) {
      console.log("❌ Notification columns DO NOT exist on customers table yet:", colError.message);
    } else {
      console.log("✅ Notification columns already exist on customers table!", colData);
    }
  }

  console.log("\nChecking columns on 'orders' table...");
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .limit(1);

  if (orderError) {
    console.log("❌ Orders read error:", orderError.message);
  } else {
    console.log("✅ Orders accessible!");
    
    // Test if notification_preference column exists
    const { data: prefData, error: prefError } = await supabase
      .from("orders")
      .select("notification_preference")
      .limit(1);
      
    if (prefError) {
      console.log("❌ notification_preference column DOES NOT exist on orders table yet:", prefError.message);
    } else {
      console.log("✅ notification_preference column already exists on orders table!", prefData);
    }
  }
}

check().catch(console.error);
