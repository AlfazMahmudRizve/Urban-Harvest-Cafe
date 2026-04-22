-- Add password column to customers table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='password') THEN 
        ALTER TABLE customers ADD COLUMN password text; 
    END IF; 
END $$;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
