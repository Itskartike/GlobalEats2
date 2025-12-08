-- Phase 2: Brand-Outlet System Database Schema
-- This migration creates the core tables for the brand-outlet system

-- Categories table (cuisine types)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands table (restaurant chains/brands)
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    cuisine_type VARCHAR(100),
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0.00,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    estimated_delivery_time INTEGER DEFAULT 30, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brand-Category relationship (many-to-many)
CREATE TABLE brand_categories (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(brand_id, category_id)
);

-- Outlets table (physical locations of brands)
CREATE TABLE outlets (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_delivery_available BOOLEAN DEFAULT true,
    is_pickup_available BOOLEAN DEFAULT true,
    delivery_radius DECIMAL(5,2) DEFAULT 5.00, -- in kilometers
    operating_hours JSONB, -- store opening/closing times for each day
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items table (brand-level menu items)
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    base_price DECIMAL(10,2) NOT NULL,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    spice_level INTEGER DEFAULT 0, -- 0=none, 1=mild, 2=medium, 3=hot, 4=very hot
    calories INTEGER,
    preparation_time INTEGER DEFAULT 15, -- in minutes
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outlet Menu Items (outlet-specific availability and pricing)
CREATE TABLE outlet_menu_items (
    id SERIAL PRIMARY KEY,
    outlet_id INTEGER REFERENCES outlets(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    outlet_price DECIMAL(10,2), -- if different from base price
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER, -- for items with limited stock
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(outlet_id, menu_item_id)
);

-- Create indexes for better performance
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_is_active ON brands(is_active);
CREATE INDEX idx_brands_is_featured ON brands(is_featured);
CREATE INDEX idx_outlets_brand_id ON outlets(brand_id);
CREATE INDEX idx_outlets_location ON outlets(latitude, longitude);
CREATE INDEX idx_outlets_is_active ON outlets(is_active);
CREATE INDEX idx_menu_items_brand_id ON menu_items(brand_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_outlet_menu_items_outlet_id ON outlet_menu_items(outlet_id);
CREATE INDEX idx_outlet_menu_items_menu_item_id ON outlet_menu_items(menu_item_id);

-- Add spatial index for location-based queries (if PostGIS is available)
-- CREATE INDEX idx_outlets_geom ON outlets USING GIST(ST_Point(longitude, latitude));
