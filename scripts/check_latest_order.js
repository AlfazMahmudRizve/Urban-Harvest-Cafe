const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Explicitly use ANON key!

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestOrder() {
  console.log("Fetching latest order using client-side ANON key...");
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(*)')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error("❌ Join query failed with ANON key:", error.message);
  } else {
    console.log("✅ Success! Joined order data via ANON key:", JSON.stringify(data, null, 2));
  }
}

checkLatestOrder().catch(console.error);
