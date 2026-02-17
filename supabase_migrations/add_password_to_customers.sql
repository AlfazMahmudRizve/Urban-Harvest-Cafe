-- Add password column to customers table for password-based auth
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password text;
