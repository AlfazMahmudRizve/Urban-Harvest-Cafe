-- SQL Patch: Enable Realtime Synchronization and Full WAL Replica Identity
-- Author: Antigravity

-- 1. Ensure the 'orders' table is added to the supabase_realtime publication
-- We use a transaction block to handle potential duplicate object errors gracefully.
do $$
begin
    if not exists (
        select 1 
        from pg_publication_tables 
        where pubname = 'supabase_realtime' 
          and tablename = 'orders'
    ) then
        alter publication supabase_realtime add table orders;
    end if;
exception
    when others then
        raise notice 'Could not add orders table to supabase_realtime publication: %', sqlerrm;
end $$;

-- 2. Ensure the 'menu_items' table is added to the supabase_realtime publication
do $$
begin
    if not exists (
        select 1 
        from pg_publication_tables 
        where pubname = 'supabase_realtime' 
          and tablename = 'menu_items'
    ) then
        alter publication supabase_realtime add table menu_items;
    end if;
exception
    when others then
        raise notice 'Could not add menu_items table to supabase_realtime publication: %', sqlerrm;
end $$;

-- 3. Set Replica Identity to FULL for maximum Realtime payload details (enables old/new row matching)
alter table orders replica identity full;
alter table menu_items replica identity full;

-- 4. Reload PostgREST schema cache to ensure all changes reflect instantly
notify pgrst, 'reload schema';
