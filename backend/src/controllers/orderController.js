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

exports.getOrders = async (req, res) => {
    try {
        const orders = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(orders.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
