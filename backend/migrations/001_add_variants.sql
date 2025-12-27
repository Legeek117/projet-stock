-- Migration V3 : Ajout des variantes et catégories
-- Date: 2025-01-27

-- 1. Créer la table categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Créer la table product_variants
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_name VARCHAR(50) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    price_adjustment DECIMAL(10, 2) DEFAULT 0
);

-- 3. Ajouter les nouvelles colonnes à products (si elles n'existent pas)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS category_name VARCHAR(50);

-- 4. Ajouter colonne variant_id à order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS variant_id INTEGER REFERENCES product_variants(id);

-- 5. Ajouter customer_name à orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);

-- 6. Migrer les anciennes catégories (si la colonne 'category' existe encore)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category') THEN
        INSERT INTO categories (name)
        SELECT DISTINCT category FROM products WHERE category IS NOT NULL
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;

-- 7. Seed des catégories de base
INSERT INTO categories (name) VALUES 
('Informatique'), ('Téléphonie'), ('Accessoires')
ON CONFLICT (name) DO NOTHING;

