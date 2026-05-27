-- Migration: Add Notification Columns for Telegram and Web Push
-- Description: Adds columns to customers and orders tables to support off-tab alerts.

-- 1. Alter customers table to support Telegram Chat ID and Browser Web Push subscription
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='telegram_chat_id') THEN 
        ALTER TABLE customers ADD COLUMN telegram_chat_id text; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='web_push_subscription') THEN 
        ALTER TABLE customers ADD COLUMN web_push_subscription jsonb; 
    END IF;
END $$;

-- 2. Alter orders table to track notification preferences
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='notification_preference') THEN 
        ALTER TABLE orders ADD COLUMN notification_preference text DEFAULT 'none'; 
    END IF;
END $$;

-- 3. Reload schema cache for PostgREST to pick up new columns instantly
NOTIFY pgrst, 'reload schema';
