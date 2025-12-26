-- Création de la table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'user', 'manager'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des produits
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des détails de commande
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- Données initiales (Seed)
-- Password 'admin123' hashé (exemple, le vrai hash sera généré par le backend normalement)
-- Ici on insère juste pour l'exemple, mais en prod on passe par l'API register
-- INSERT INTO users (username, email, password_hash, role) VALUES 
-- ('admin', 'admin@stock.local', '$2b$10$EpOd/..', 'admin');

INSERT INTO products (name, description, price, stock_quantity, category) VALUES
('Laptop Dell XPS', 'Ordinateur portable haute performance', 1299.99, 10, 'Informatique'),
('Souris Logitech', 'Souris sans fil ergonomique', 29.99, 50, 'Informatique'),
('Écran Samsung 27"', 'Moniteur 4K UHD', 349.50, 15, 'Informatique');
