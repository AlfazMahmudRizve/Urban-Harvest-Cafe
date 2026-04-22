-- Enable RLS on menu_items if not already
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous read access (so homepage can load items)
CREATE POLICY "Allow public read access"
ON menu_items
FOR SELECT
TO anon
USING (true);

-- Policy to allow authenticated read access (just in case)
CREATE POLICY "Allow authenticated read access"
ON menu_items
FOR SELECT
TO authenticated
USING (true);

-- Policy to allow service_role (server actions) full access
-- (Service role bypasses RLS by default, but good to be explicit if needed, 
-- usually not required for service_role)
