const { pool } = require('../config/db');

// --- STOCK MOVEMENTS ---

// Enregistrer un nouveau mouvement de stock
exports.createMovement = async (req, res) => {
    const { product_id, type, quantity, reason } = req.body;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Récupérer le stock actuel
        const productRes = await client.query('SELECT stock_quantity FROM products WHERE id = $1', [product_id]);
        if (productRes.rows.length === 0) {
            throw new Error('Produit non trouvé');
        }
        const oldStock = productRes.rows[0].stock_quantity;

        // 2. Calculer le nouveau stock
        let newStock = oldStock;
        if (type === 'in' || type === 'return') {
            newStock = oldStock + parseInt(quantity);
        } else if (type === 'out' || type === 'loss' || type === 'adjustment_out') {
            newStock = oldStock - parseInt(quantity);
        } else if (type === 'adjustment_in') {
            newStock = oldStock + parseInt(quantity);
        }

        if (newStock < 0) {
            throw new Error('Le stock résultant ne peut pas être négatif');
        }

        // 3. Mettre à jour le stock du produit
        await client.query('UPDATE products SET stock_quantity = $1 WHERE id = $2', [newStock, product_id]);

        // 4. Enregistrer le mouvement
        const movementRes = await client.query(
            `INSERT INTO stock_movements (product_id, user_id, type, quantity, old_stock, new_stock, reason) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [product_id, userId, type, quantity, oldStock, newStock, reason]
        );

        await client.query('COMMIT');
        res.status(201).json(movementRes.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(400).json({ message: err.message });
    } finally {
        client.release();
    }
};

// Récupérer l'historique des mouvements (avec filtres optionnels)
exports.getMovements = async (req, res) => {
    try {
        const { product_id, type, limit = 50 } = req.query;
        let query = `
            SELECT sm.*, p.name as product_name, u.username 
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            JOIN users u ON sm.user_id = u.id
        `;
        const params = [];

        if (product_id) {
            params.push(product_id);
            query += ` WHERE sm.product_id = $${params.length}`;
        }

        if (type) {
            params.push(type);
            query += params.length === 1 ? ' WHERE ' : ' AND ';
            query += `sm.type = $${params.length}`;
        }

        query += ` ORDER BY sm.created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- PRICE HISTORY ---

// Récupérer l'historique des prix d'un produit
exports.getPriceHistory = async (req, res) => {
    try {
        const { product_id } = req.params;
        const result = await pool.query(
            `SELECT ph.*, u.username 
             FROM price_history ph
             LEFT JOIN users u ON ph.changed_by = u.id
             WHERE ph.product_id = $1 
             ORDER BY ph.created_at DESC`,
            [product_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- ALERTS ---

// Produits en stock critique (< min_stock ou 5 par défaut)
exports.getLowStockAlerts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, stock_quantity, category_name 
             FROM products 
             WHERE stock_quantity < 5 
             ORDER BY stock_quantity ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
