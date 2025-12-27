-- Création de la table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'user', 'manager'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des catégories (V3)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Création de la table des produits (Updated V3)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0, -- Stock global ou stock si pas de variante
    category_id INTEGER REFERENCES categories(id), -- Lien vers la catégorie
    -- On garde category (string) temporairement si besoin, mais mieux vaut utiliser la relation
    category_name VARCHAR(50), -- Backup pour l'affichage facile sans join compliqué pour l'instant
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des variantes (V3)
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_name VARCHAR(50) NOT NULL, -- ex: "Rouge", "XL", "42"
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    price_adjustment DECIMAL(10, 2) DEFAULT 0 -- Si le prix change pour cette variante
);

-- Création de la table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id), -- Qui a vendu
    customer_name VARCHAR(100), -- (V3) Optionnel : Nom du client
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'validated', -- 'validated', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des détails de commande
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id), -- (V3) Quelle variante vendue ?
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- Données initiales (Seed)
INSERT INTO categories (name) VALUES ('Informatique'), ('Téléphonie'), ('Accessoires');

-- Note: Les produits devront être créés via l'interface pour lier les IDs correctement.
