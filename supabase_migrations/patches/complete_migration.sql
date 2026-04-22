-- 1. Add password column to customers table (if safe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='password') THEN 
        ALTER TABLE customers ADD COLUMN password text; 
    END IF; 
END $$;

-- 2. Create Menu Items Table (if not exists)
create table if not exists menu_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  price numeric not null,
  category text not null,
  image text,
  tags text[] default '{}',
  available boolean default true
);

-- 3. Enable RLS on Menu Items
alter table menu_items enable row level security;

-- 4. Policies for Menu Items
create policy "Allow public read access" on menu_items for select using (true);
-- Note: specific admin policies should be refined based on auth setup, but allowing all for now or restricting to service role
create policy "Allow admin insert" on menu_items for insert with check (true); 
create policy "Allow admin update" on menu_items for update using (true);
create policy "Allow admin delete" on menu_items for delete using (true);

-- 5. Seed Data (Only if empty to avoid duplicates)
insert into menu_items (name, price, category, image, tags) 
select 'Chicken Popcorn', 179, 'Quick Bites', 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=2070&auto=format&fit=crop', '{}'
where not exists (select 1 from menu_items where name = 'Chicken Popcorn');

insert into menu_items (name, price, category, image, tags)
select 'Naga Fire Bites', 239, 'Quick Bites', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop', '{"spicy"}'
where not exists (select 1 from menu_items where name = 'Naga Fire Bites');

insert into menu_items (name, price, category, image, tags)
select 'Bukhari Rice', 349, 'Heavy Hitters', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=2070&auto=format&fit=crop', '{"bestseller"}'
where not exists (select 1 from menu_items where name = 'Bukhari Rice');

insert into menu_items (name, price, category, image, tags)
select 'Cream''son Pasta', 289, 'Heavy Hitters', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop', '{}'
where not exists (select 1 from menu_items where name = 'Cream''son Pasta');

insert into menu_items (name, price, category, image, tags)
select 'Sizzling Chicken', 120, 'Sides', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=2070&auto=format&fit=crop', '{}'
where not exists (select 1 from menu_items where name = 'Sizzling Chicken');

insert into menu_items (name, price, category, image, tags)
select 'Big-Belly Cheesy Pasta', 399, 'Heavy Hitters', 'https://images.unsplash.com/photo-1626844131082-256783844137?q=80&w=1935&auto=format&fit=crop', '{"bestseller"}'
where not exists (select 1 from menu_items where name = 'Big-Belly Cheesy Pasta');

-- 6. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';
