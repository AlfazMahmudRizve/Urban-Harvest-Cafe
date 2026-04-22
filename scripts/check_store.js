const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve('e:/Ai Agents/whoisalfaz.me/Web Projects/antigravity/urban cafe', '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('store_settings').select('*');
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Data:', data);
    }
}
check();
