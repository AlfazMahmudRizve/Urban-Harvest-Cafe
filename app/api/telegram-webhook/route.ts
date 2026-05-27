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

        // 1. Handle Callback Queries (when user clicks an inline button with callback_data)
        const callbackQuery = body.callback_query;
        if (callbackQuery) {
            const queryId = callbackQuery.id;
            const data = callbackQuery.data;
            const chatId = callbackQuery.message.chat.id.toString();

            // Always answer callback query to remove Telegram's loading spinner
            await answerCallbackQuery(queryId);

            if (data === 'view_menu') {
                await sendMenuResponse(chatId);
            }
            return NextResponse.json({ success: true });
        }

        const message = body.message;
        if (!message || !message.text) {
            return NextResponse.json({ success: true, message: 'No message text found' });
        }

        const text = message.text.trim();
        const textLower = text.toLowerCase();
        const chatId = message.chat.id.toString();

        // 2. Check for deep linking command: /start PAYLOAD
        if (text.startsWith('/start ') && text.length > 7) {
            const payload = text.substring(7).trim();
            console.log(`Deep link payload detected: ${payload}, chatId=${chatId}`);

            // A. Table Lock Deep Link (/start table_N)
            if (payload.startsWith('table_')) {
                const tableNumber = payload.substring(6).trim();
                console.log(`Table lock detected: Table ${tableNumber} for Chat ID ${chatId}`);

                const welcomeText = `☕ *Welcome to Urban Harvest, sitting at Table ${tableNumber}!* 🥐\n\nWe have automatically locked in your table location. Tap "Order Online" below to browse our live menu, customize your items, and checkout directly from your chat!`;
                
                const replyMarkup = {
                    inline_keyboard: [
                        [
                            { text: `🌐 Order Online (Table ${tableNumber})`, web_app: { url: `https://urbancafe.whoisalfaz.me/?table=${tableNumber}` } }
                        ],
                        [
                            { text: '📖 Open in Browser', url: `https://urbancafe.whoisalfaz.me/?table=${tableNumber}` }
                        ]
                    ]
                };

                await sendTelegramMessage(chatId, welcomeText, replyMarkup);
                return NextResponse.json({ success: true });
            }

            // B. Order Notification Link (/start CUSTOMER_ID)
            const customerId = payload;
            
            // Update customer record in Supabase
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

            // Look for their latest active order (pending or cooking)
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

            // Send successful opt-in message back in Telegram
            const itemsText = order ? `\n\nYour active order has been linked! 🛍️ We'll notify you when it's ready.` : '';
            const welcomeText = `☕ *Welcome to Urban Harvest, ${customer.name}!* \n\nWe've securely connected your account to real-time status alerts! You will receive a direct push notification here the split-second your food is hot and ready! 🔥${itemsText}`;
            
            await sendTelegramMessage(chatId, welcomeText);
            return NextResponse.json({ success: true });
        }

        // 3. Handle Menu Intent Command (/menu, menu, food, coffee, etc.)
        const genericMenuIntents = ['/menu', 'menu', '/food', 'food', 'drink', 'drinks', 'eat', 'beverage', 'beverages', 'pastry', 'pastries', 'coffee', 'espresso', 'pastries'];
        const isMenuIntent = genericMenuIntents.some(intent => textLower.includes(intent));

        if (isMenuIntent) {
            await sendMenuResponse(chatId);
            return NextResponse.json({ success: true });
        }

        // 4. Default Welcome Greeting
        const welcomeText = `☕ *Welcome to Urban Harvest Cafe!* \n\nIndulge in our artisan specialty coffee, freshly baked pastries, and savory delights—crafted daily with premium, organic ingredients.\n\n👇 *Quick Actions:* \n• Launch our interactive digital storefront directly inside Telegram to order.\n• Or view our live daily menu instantly here!`;
        
        const replyMarkup = {
            inline_keyboard: [
                [
                    { text: '🌐 Order Online (Web App)', web_app: { url: 'https://urbancafe.whoisalfaz.me' } }
                ],
                [
                    { text: '📋 View Today\'s Menu', callback_data: 'view_menu' }
                ],
                [
                    { text: '📖 Open in Browser', url: 'https://urbancafe.whoisalfaz.me' }
                ]
            ]
        };

        await sendTelegramMessage(chatId, welcomeText, replyMarkup);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Telegram Webhook error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

async function sendMenuResponse(chatId: string) {
    try {
        // Fetch active, available menu items from Supabase
        const { data: menuItems, error: menuError } = await supabaseAdmin
            .from('menu_items')
            .select('name, price, category, tags')
            .eq('available', true)
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (menuError || !menuItems || menuItems.length === 0) {
            console.error('Error fetching menu items:', menuError);
            await sendTelegramMessage(chatId, "⚠️ Sorry, we couldn't load our menu right now. Please check our online storefront to order! 🥐");
            return;
        }

        // Group menu items by category
        const categories: { [key: string]: typeof menuItems } = {};
        menuItems.forEach((item) => {
            const cat = item.category || 'Specialty';
            if (!categories[cat]) {
                categories[cat] = [];
            }
            categories[cat].push(item);
        });

        // Generate dynamic Markdown representation
        let menuText = `☕ *URBAN HARVEST CAFE MENU* 🥐\n`;
        menuText += `_Freshly prepared daily with organic & premium ingredients_\n\n`;

        for (const [catName, items] of Object.entries(categories)) {
            let categoryEmoji = '🍽️';
            const lowerCat = catName.toLowerCase();
            if (lowerCat.includes('coffee') || lowerCat.includes('drink') || lowerCat.includes('beverage')) {
                categoryEmoji = '☕';
            } else if (lowerCat.includes('bakery') || lowerCat.includes('pastry') || lowerCat.includes('dessert') || lowerCat.includes('sweet') || lowerCat.includes('waffle') || lowerCat.includes('croissant')) {
                categoryEmoji = '🥐';
            } else if (lowerCat.includes('food') || lowerCat.includes('main') || lowerCat.includes('breakfast') || lowerCat.includes('lunch') || lowerCat.includes('dinner')) {
                categoryEmoji = '🍳';
            } else if (lowerCat.includes('snack') || lowerCat.includes('side') || lowerCat.includes('appetizer')) {
                categoryEmoji = '🍟';
            }

            menuText += `*${categoryEmoji} ${catName.toUpperCase()}*\n`;
            
            items.forEach((item) => {
                const priceFormatted = typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2);
                const tagString = (item.tags && item.tags.length > 0) ? ` _(${item.tags.slice(0, 2).join(', ')})_` : '';
                menuText += `• ${item.name} — $${priceFormatted}${tagString}\n`;
            });
            menuText += `\n`;
        }

        menuText += `✨ *Ready to order?* Tap "Order Online" below to open the storefront right in your chat!`;

        const replyMarkup = {
            inline_keyboard: [
                [
                    { text: '🌐 Order Online (Web App)', web_app: { url: 'https://urbancafe.whoisalfaz.me' } }
                ],
                [
                    { text: '📖 Open in Browser', url: 'https://urbancafe.whoisalfaz.me' }
                ]
            ]
        };

        await sendTelegramMessage(chatId, menuText, replyMarkup);
    } catch (err) {
        console.error('Failed to create/send menu:', err);
        await sendTelegramMessage(chatId, "⚠️ Oops! Something went wrong while formatting our menu. Please order online directly! ☕");
    }
}

async function answerCallbackQuery(callbackQueryId: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return;

    try {
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: callbackQueryId
            })
        });
    } catch (err) {
        console.error('Failed to answer callback query:', err);
    }
}

async function sendTelegramMessage(chatId: string, text: string, replyMarkup?: any) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        console.error('TELEGRAM_BOT_TOKEN is missing in environment variables');
        return;
    }

    try {
        const payload: any = {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        };

        if (replyMarkup) {
            payload.reply_markup = replyMarkup;
        }

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Failed to send Telegram message:', err);
    }
}
