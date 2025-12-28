const { pool } = require('../config/db');

// --- Fournisseurs ---

exports.getSuppliers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM suppliers ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createSupplier = async (req, res) => {
    const { name, phone, email, address } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO suppliers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, phone, email, address]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Achats ---

exports.createPurchase = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { supplier_id, items } = req.body;
        const userId = req.user.id;

        // 1. Calculer le total
        let totalAmount = 0;
        for (const item of items) {
            totalAmount += item.quantity * item.unit_price;
        }

        // 2. Créer l'entête de l'achat
        const purchaseResult = await client.query(
            'INSERT INTO purchases (supplier_id, user_id, total_amount) VALUES ($1, $2, $3) RETURNING id',
            [supplier_id, userId, totalAmount]
        );
        const purchaseId = purchaseResult.rows[0].id;

        // 3. Insérer les articles et mettre à jour le stock
        for (const item of items) {
            // Détails de l'achat
            await client.query(
                'INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
                [purchaseId, item.product_id, item.quantity, item.unit_price]
            );

            // Récupérer stock actuel pour le mouvement
            const productRes = await client.query('SELECT stock_quantity, name FROM products WHERE id = $1', [item.product_id]);
            const currentStock = productRes.rows[0].stock_quantity;
            const productName = productRes.rows[0].name;

            // Mise à jour du stock physique
            await client.query(
                'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );

            // Enregistrer le mouvement de stock
            await client.query(
                `INSERT INTO stock_movements (product_id, user_id, type, quantity, old_stock, new_stock, reason) 
                 VALUES ($1, $2, 'in', $3, $4, $5, $6)`,
                [item.product_id, userId, item.quantity, currentStock, currentStock + item.quantity, `Achat #${purchaseId}`]
            );

            // Optionnel: Historique des prix si prix d'achat change (ici on enregistre le prix d'achat)
            // Note: Nous n'avions pas de distinction purchase/sale dans le contrôleur produit de base
            // on l'ajoute ici pour la traçabilité
            await client.query(
                'INSERT INTO price_history (product_id, new_price, type, changed_by) VALUES ($1, $2, $3, $4)',
                [item.product_id, item.unit_price, 'purchase', userId]
            );
        }

        await client.query('COMMIT');
        res.json({ id: purchaseId, message: 'Achat enregistré et stock mis à jour' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
};

exports.getPurchases = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, s.name as supplier_name, u.username as creator_name,
            (SELECT json_agg(json_build_object('product_name', pr.name, 'quantity', pi.quantity, 'unit_price', pi.unit_price))
             FROM purchase_items pi
             JOIN products pr ON pi.product_id = pr.id
             WHERE pi.purchase_id = p.id) as items
            FROM purchases p
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
