-- Migration to Urban Harvest Cafe Menu

-- 1. Clear existing fast food items
DELETE FROM menu_items;

-- 2. Insert new Cafe Menu Items
INSERT INTO menu_items (name, price, category, image, tags, available)
VALUES
    (
        'Classic Espresso', 
        120, 
        'Drinks', 
        'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=2070&auto=format&fit=crop', 
        '{"bestseller"}', 
        true
    ),
    (
        'Hazelnut Latte', 
        180, 
        'Drinks', 
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=2052&auto=format&fit=crop', 
        '{}', 
        true
    ),
    (
        'Buttery Croissant', 
        150, 
        'Breakfast', 
        'https://images.unsplash.com/photo-1549902584-fc09593526pf?q=80&w=800&auto=format&fit=crop', 
        '{"fresh"}', 
        true
    ),
    (
        'Avocado Sourdough Toast', 
        250, 
        'Breakfast', 
        'https://images.unsplash.com/photo-1588137372308-15f75323a51d?q=80&w=800&auto=format&fit=crop', 
        '{"healthy"}', 
        true
    ),
    (
        'New York Cheesecake', 
        300, 
        'Dessert', 
        'https://images.unsplash.com/photo-1524351199678-941a58a3df50?q=80&w=2071&auto=format&fit=crop', 
        '{"sweet"}', 
        true
    ),
    (
        'Grilled Chicken Panini', 
        280, 
        'Lunch', 
        'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=2073&auto=format&fit=crop', 
        '{}', 
        true
    );

-- 3. Notify PostgREST to reload schema (optional but good practice)
NOTIFY pgrst, 'reload schema';
