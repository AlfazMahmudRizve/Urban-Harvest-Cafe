
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking "customers" table for "password" column...');

    // Attempt to select the password column. 
    // If it doesn't exist, PostgREST usually throws an error like "Could not find the 'password' column..."
    const { data, error } = await supabase
        .from('customers')
        .select('id, password')
        .limit(1);

    if (error) {
        console.error('❌ Error selecting password column:', error.message);
        if (error.message.includes('Could not find') || error.code === 'PGRST204') {
            console.log('diagnosis: PASSWORD COLUMN MISSING');
        } else {
            console.log('diagnosis: UNKNOWN ERROR');
        }
    } else {
        console.log('✅ Success! Password column exists.');
        console.log('Data sample:', data);
    }
}

check();
