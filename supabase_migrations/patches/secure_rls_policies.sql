-- SQL Patch: Zero-Trust Row Level Security Hardening
-- Author: Antigravity

-- 1. Remove public read/write policies on customers table
drop policy if exists "Enable read access for all users" on customers;
drop policy if exists "Enable insert for all users" on customers;
drop policy if exists "Enable update for all users" on customers;

-- 2. Remove public read/write policies on orders table
drop policy if exists "Enable read access for all users" on orders;
drop policy if exists "Enable insert for all users" on orders;
drop policy if exists "Enable update for all users" on orders;

-- 3. Lock down public selects to restrict anonymous reads on customers
-- Standard public clients can no longer fetch raw customer lists.
-- All profile selections are routed securely through Server Actions via service_role.
create policy "Allow inserts for checkout registration" on customers for insert with check (true);
create policy "Restrict anonymous select on customers" on customers for select using (false);
create policy "Restrict anonymous update on customers" on customers for update using (false);

-- 4. Lock down public selects to restrict anonymous reads on orders
create policy "Allow inserts for order placement" on orders for insert with check (true);
create policy "Restrict anonymous select on orders" on orders for select using (false);
create policy "Restrict anonymous update on orders" on orders for update using (false);

-- 5. Reload PostgREST schema cache
notify pgrst, 'reload schema';
