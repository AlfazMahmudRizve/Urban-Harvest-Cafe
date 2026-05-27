import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerId, subscription } = body;

        if (!customerId || !subscription) {
            return NextResponse.json({ success: false, error: 'Missing customerId or subscription' }, { status: 400 });
        }

        console.log(`Web Push Subscription request for customer: ${customerId}`);

        // 1. Update customer record with Web Push subscription object
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .update({ web_push_subscription: subscription })
            .eq('id', customerId)
            .select()
            .single();

        if (customerError) {
            console.error('Error saving web_push_subscription:', customerError);
            return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
        }

        if (!customer) {
            console.warn('Customer not found for subscription:', customerId);
            return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
        }

        console.log(`Saved Web Push Subscription for customer ${customer.name}`);

        // 2. Find their latest active order (pending or cooking)
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('customer_id', customerId)
            .in('status', ['pending', 'cooking'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (order && !orderError) {
            // Update this order's notification preference to 'web-push'
            await supabaseAdmin
                .from('orders')
                .update({ notification_preference: 'web-push' })
                .eq('id', order.id);
            console.log(`Updated order ${order.id} notification preference to web-push`);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Web Push subscription API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
