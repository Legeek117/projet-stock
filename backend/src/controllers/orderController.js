const { pool } = require('../config/db'); // Use pool for transactions

exports.createOrder = async (req, res) => {
    const { items, total_amount } = req.body; // items = [{ product_id, quantity }]
    const userId = req.user.id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create Order
        const orderRes = await client.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id',
            [userId, total_amount, 'completed']
        );
        const orderId = orderRes.rows[0].id;

        // 2. Process Items
        for (const item of items) {
            // Check stock
            const productRes = await client.query('SELECT price, stock_quantity FROM products WHERE id = $1', [item.product_id]);
            if (productRes.rows.length === 0) {
                throw new Error(`Product ${item.product_id} not found`);
            }
            const product = productRes.rows[0];

            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}`);
            }

            // Deduct stock
            await client.query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, item.product_id]);

            // Add Stock Movement
            await client.query(
                `INSERT INTO stock_movements (product_id, user_id, type, quantity, old_stock, new_stock, reason) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [item.product_id, userId, 'sale', item.quantity, product.stock_quantity, product.stock_quantity - item.quantity, `Vente #${orderId}`]
            );

            // Add Order Item
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
                [orderId, item.product_id, item.quantity, product.price]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Order created successfully', orderId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(400).json({ message: err.message || 'Transaction failed' });
    } finally {
        client.release();
    }
};

// Get all orders (Admin: all orders, User: only their orders)
exports.getAllOrders = async (req, res) => {
    try {
        let query = `
            SELECT 
                o.*,
                u.username,
                (
                    SELECT json_agg(
                        json_build_object(
                            'product_name', p.name,
                            'quantity', oi.quantity,
                            'unit_price', oi.unit_price
                        )
                    )
                    FROM order_items oi
                    LEFT JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = o.id
                ) as items
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id
        `;

        let params = [];

        // Si l'utilisateur n'est pas admin, filtrer par user_id
        if (req.user.role !== 'admin') {
            query += ' WHERE o.user_id = $1';
            params.push(req.user.id);
        }

        query += ' ORDER BY o.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(orders.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
