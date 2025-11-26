-- Manual Migration Script for Products Table
-- Execute this SQL directly in PostgreSQL if migration:run command fails

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "price" decimal(10,2) NOT NULL,
  "stock" integer NOT NULL DEFAULT 0,
  "sku" varchar(100) NOT NULL UNIQUE,
  "categoryId" varchar(100) NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "IDX_PRODUCTS_SKU" ON "products" ("sku");
CREATE INDEX IF NOT EXISTS "IDX_PRODUCTS_CATEGORY_ID" ON "products" ("categoryId");
CREATE INDEX IF NOT EXISTS "IDX_PRODUCTS_IS_ACTIVE" ON "products" ("isActive");
CREATE INDEX IF NOT EXISTS "IDX_PRODUCTS_STOCK" ON "products" ("stock");
CREATE INDEX IF NOT EXISTS "IDX_PRODUCTS_CREATED_AT" ON "products" ("createdAt");

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Insert sample data (optional)
-- INSERT INTO "products" ("name", "description", "price", "stock", "sku", "categoryId") 
-- VALUES 
--   ('Laptop Dell XPS 15', 'High-performance laptop', 1500.00, 10, 'LAPTOP-XPS-001', 'electronics'),
--   ('Mouse Logitech MX Master', 'Ergonomic wireless mouse', 99.99, 50, 'MOUSE-LG-001', 'electronics'),
--   ('Keyboard Mechanical', 'RGB mechanical keyboard', 149.99, 25, 'KB-MECH-001', 'electronics');

COMMIT;
