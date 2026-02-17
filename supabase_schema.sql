-- Create Customers Table
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text unique not null,
  address text,
  total_spend numeric default 0,
  visit_count integer default 0,
  last_order timestamp with time zone
);

-- Update Orders Table (or Create if not exists)
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references customers(id),
  items jsonb not null, -- Stores the cart items as JSON
  total_amount numeric not null,
  status text default 'pending', -- pending, cooking, completed, cancelled
  delivery_address text,
  table_number text,
  order_type text -- delivery or dine-in
);

-- Enable Row Level Security (RLS)
alter table customers enable row level security;
alter table orders enable row level security;

-- Policies (Adjust based on your Auth setup)
-- For now, allowing public read/write for demo purposes (NOT RECOMMENDED FOR PRODUCTION)
-- Ideally, use Service Role for server-side operations and authenticated users for client-side.

create policy "Enable read access for all users" on customers for select using (true);
create policy "Enable insert for all users" on customers for insert with check (true);
create policy "Enable update for all users" on customers for update using (true);

create policy "Enable read access for all users" on orders for select using (true);
create policy "Enable insert for all users" on orders for insert with check (true);
create policy "Enable update for all users" on orders for update using (true);

-- Enable Realtime
alter publication supabase_realtime add table orders;
