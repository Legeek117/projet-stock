-- Table pour l'historique des mouvements de stock
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- 'in' (entrée), 'out' (sortie), 'adjustment' (ajustement), 'sale' (vente), 'return' (retour), 'loss' (perte)
    quantity INTEGER NOT NULL, -- Quantité du mouvement (positive)
    old_stock INTEGER NOT NULL, -- Stock avant le mouvement
    new_stock INTEGER NOT NULL, -- Stock après le mouvement
    reason TEXT, -- Motif du mouvement (ex: "Nouvel arrivage", "Vente #123", "Produit cassé")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour l'historique des prix
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) DEFAULT 'sale', -- 'sale' (prix de vente), 'purchase' (prix d'achat)
    changed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour accélérer les recherches
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_price_history_product ON price_history(product_id);
