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
        console.log('Telegram Webhook received:', JSON.stringify(body));

        const message = body.message;
        if (!message || !message.text) {
            return NextResponse.json({ success: true, message: 'No message text found' });
        }

        const text = message.text.trim();
        const chatId = message.chat.id.toString();

        // Check for deep linking command: /start CUSTOMER_ID
        if (text.startsWith('/start ')) {
            const customerId = text.substring(7).trim(); // Extract CUSTOMER_ID
            console.log(`Deep link detected: customerId=${customerId}, chatId=${chatId}`);

            // 1. Update customer record in Supabase
            const { data: customer, error: customerError } = await supabaseAdmin
                .from('customers')
                .update({ telegram_chat_id: chatId })
                .eq('id', customerId)
                .select()
                .single();

            if (customerError) {
                console.error('Error updating customer telegram_chat_id:', customerError);
                await sendTelegramMessage(chatId, "⚠️ Sorry, we couldn't connect your order. Please make sure you scanned the correct QR code or try ordering again! 🥐");
                return NextResponse.json({ success: false, error: 'Database update failed' });
            }

            if (!customer) {
                console.warn('Customer not found for ID:', customerId);
                await sendTelegramMessage(chatId, "⚠️ Sorry, we couldn't find your order record. Please scan the QR code at the cafe to proceed! 🥐");
                return NextResponse.json({ success: false, error: 'Customer not found' });
            }

            console.log(`Successfully linked customer ${customer.name} with Telegram Chat ID ${chatId}`);

            // 2. Look for their latest active order (pending or cooking)
            const { data: order, error: orderError } = await supabaseAdmin
                .from('orders')
                .select('*')
                .eq('customer_id', customerId)
                .in('status', ['pending', 'cooking'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (order && !orderError) {
                // Update this order's notification preference to 'telegram'
                await supabaseAdmin
                    .from('orders')
                    .update({ notification_preference: 'telegram' })
                    .eq('id', order.id);
                console.log(`Updated order ${order.id} notification preference to telegram`);
            }

            // 3. Send successful opt-in message back in Telegram
            const itemsText = order ? `\n\nYour active order has been linked! 🛍️ We'll notify you when it's ready.` : '';
            const welcomeText = `☕ *Welcome to Urban Harvest, ${customer.name}!* \n\nWe've securely connected your account to real-time status alerts! You will receive a direct push notification here the split-second your food is hot and ready! 🔥${itemsText}`;
            
            await sendTelegramMessage(chatId, welcomeText);
        } else {
            // General greeting for text messages sent directly
            const defaultText = `☕ *Welcome to Urban Harvest Cafe!* \n\nTo receive order notifications directly on your phone, please place an order on our site and select "Telegram Alerts" on the order success page. We'll handle the rest! 🥐`;
            await sendTelegramMessage(chatId, defaultText);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Telegram Webhook error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

async function sendTelegramMessage(chatId: string, text: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        console.error('TELEGRAM_BOT_TOKEN is missing in environment variables');
        return;
    }

    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });
    } catch (err) {
        console.error('Failed to send Telegram message:', err);
    }
}
