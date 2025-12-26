const db = require('../config/db');

exports.getProducts = async (req, res) => {
    try {
        const products = await db.query('SELECT * FROM products ORDER BY id ASC');
        res.json(products.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await db.query('SELECT * FROM products WHERE id = $1', [id]);

        if (product.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createProduct = async (req, res) => {
    const { name, description, price, stock_quantity, category } = req.body;
    try {
        const newProduct = await db.query(
            'INSERT INTO products (name, description, price, stock_quantity, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, stock_quantity, category]
        );
        res.json(newProduct.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock_quantity, category } = req.body;
    try {
        // Build update query dynamically or statically (simplified here)
        const updateProduct = await db.query(
            'UPDATE products SET name = $1, description = $2, price = $3, stock_quantity = $4, category = $5 WHERE id = $6 RETURNING *',
            [name, description, price, stock_quantity, category, id]
        );

        if (updateProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(updateProduct.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteProduct = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

        if (deleteProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
