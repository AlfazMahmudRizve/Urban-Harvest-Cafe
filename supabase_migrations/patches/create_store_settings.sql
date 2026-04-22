-- Create Store Settings table for manual overrides
create table if not exists store_settings (
  id int primary key default 1,
  manual_status text check (manual_status in ('OPEN', 'CLOSED')),
  override_expires_at timestamp with time zone,
  updated_at timestamp with time zone default now()
);

-- Insert default row (id=1) if not exists
insert into store_settings (id, manual_status, override_expires_at)
values (1, null, null)
on conflict (id) do nothing;

-- Enable RLS
alter table store_settings enable row level security;

-- Policies
create policy "Allow public read access" on store_settings for select using (true);
create policy "Allow admin update" on store_settings for update using (true); -- Adjust for auth if needed

-- Refresh Schema
NOTIFY pgrst, 'reload schema';
