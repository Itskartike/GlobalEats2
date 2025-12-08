-- Step 1: First, let's check what outlets and brands exist
SELECT id, name FROM outlets;
SELECT id, name FROM brands;

-- Step 2: Add brands to outlets using the outlet_brands junction table
-- Example: Adding multiple brands to the "Grabs Kitchen - Nahur" outlet

-- Get the outlet ID for Nahur outlet (replace with actual ID from step 1)
-- Get brand IDs for the brands you want to add (replace with actual IDs from step 1)

-- Insert brand associations for an outlet
INSERT INTO outlet_brands (outlet_id, brand_id, is_active, created_at, updated_at) VALUES
-- Replace these UUIDs with actual outlet_id and brand_ids from your database
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true, NOW(), NOW()),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, NOW(), NOW()),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '22ecf053-2a52-47e1-9e99-c5a4be9f871d', true, NOW(), NOW());

-- Example: If you want to add Pizza Hut, KFC, and McDonald's to a specific outlet:
-- First find the IDs:
-- SELECT id, name FROM outlets WHERE name LIKE '%Nahur%';
-- SELECT id, name FROM brands WHERE name IN ('Pizza Hut', 'KFC', 'McDonald''s');

-- Then insert the associations (replace with actual IDs):
-- INSERT INTO outlet_brands (outlet_id, brand_id, is_active, created_at, updated_at) VALUES
-- ('actual-nahur-outlet-id', 'pizza-hut-brand-id', true, NOW(), NOW()),
-- ('actual-nahur-outlet-id', 'kfc-brand-id', true, NOW(), NOW()),
-- ('actual-nahur-outlet-id', 'mcdonalds-brand-id', true, NOW(), NOW());
