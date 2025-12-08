-- Migration: Convert from single-brand outlets to multi-brand outlets
-- This migration script updates the database schema for Phase 3A

-- Step 1: Create outlet_brands junction table
CREATE TABLE IF NOT EXISTS outlet_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true,
    preparation_time INTEGER DEFAULT 30,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0.0,
    delivery_fee DECIMAL(10,2) DEFAULT 0.0,
    commission_rate DECIMAL(5,2) DEFAULT 15.0,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(outlet_id, brand_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_outlet_brands_outlet_id ON outlet_brands(outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_brands_brand_id ON outlet_brands(brand_id);
CREATE INDEX IF NOT EXISTS idx_outlet_brands_available ON outlet_brands(is_available);

-- Step 2: Migrate existing outlet-brand relationships
-- Convert existing outlets.brand_id into outlet_brands relationships
INSERT INTO outlet_brands (outlet_id, brand_id, is_available, created_at, updated_at)
SELECT 
    id as outlet_id,
    brand_id,
    true as is_available,
    NOW() as created_at,
    NOW() as updated_at
FROM outlets 
WHERE brand_id IS NOT NULL
ON CONFLICT (outlet_id, brand_id) DO NOTHING;

-- Step 3: Update outlet_menu_items to include pricing
-- Add outlet-specific pricing columns if they don't exist
ALTER TABLE outlet_menu_items 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 15;

-- Step 4: Update orders table to include outlet assignment
-- Add outlet_id to orders if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS outlet_id UUID REFERENCES outlets(id),
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);

-- Create index for orders
CREATE INDEX IF NOT EXISTS idx_orders_outlet_id ON orders(outlet_id);
CREATE INDEX IF NOT EXISTS idx_orders_brand_id ON orders(brand_id);

-- Step 5: (Optional) Remove brand_id from outlets table
-- WARNING: This will break existing relationships - only run after data migration
-- ALTER TABLE outlets DROP COLUMN IF EXISTS brand_id;

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'Phase 3A Migration completed successfully!';
    RAISE NOTICE 'outlet_brands table created with % records', (SELECT COUNT(*) FROM outlet_brands);
END $$;
