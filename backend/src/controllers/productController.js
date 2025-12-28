const db = require('../config/db');

// Récupérer tous les produits (avec variantes)
exports.getAllProducts = async (req, res) => {
    try {
        // Requête complexe pour récupérer le produit ET ses variantes sous forme de tableau JSON
        const query = `
            SELECT 
                p.*,
                c.name as category_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', pv.id,
                            'variant_name', pv.variant_name,
                            'stock_quantity', pv.stock_quantity,
                            'price_adjustment', pv.price_adjustment
                        ) 
                    ) FILTER (WHERE pv.id IS NOT NULL), 
                    '[]'
                ) as variants
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            GROUP BY p.id, c.name
            ORDER BY p.id DESC
        `;

        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Créer un produit (avec variantes et catégorie)
exports.createProduct = async (req, res) => {
    const { name, description, price, category_name, variants } = req.body;
    // variants est un tableau : [{ name: "XL", stock: 10 }, { name: "L", stock: 5 }] (optionnel)
    // category_name est le nom (string). On doit trouver son ID ou le créer.

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Gérer la catégorie
        let categoryId = null;
        if (category_name) {
            const catRes = await client.query("SELECT id FROM categories WHERE name = $1", [category_name]);
            if (catRes.rows.length > 0) {
                categoryId = catRes.rows[0].id;
            } else {
                const newCat = await client.query("INSERT INTO categories (name) VALUES ($1) RETURNING id", [category_name]);
                categoryId = newCat.rows[0].id;
            }
        }

        // 2. Insérer le produit
        // Le stock global est la somme des variantes si elles existent, sinon stoké direct (ici on attend variants)
        let totalStock = 0;
        if (variants && variants.length > 0) {
            totalStock = variants.reduce((acc, v) => acc + parseInt(v.stock), 0);
        } else {
            // Si pas de variantes, on met stock à 0 par défaut ou on prend req.body.stock_quantity simple
            totalStock = req.body.stock_quantity || 0;
        }

        const productRes = await client.query(
            "INSERT INTO products (name, description, price, stock_quantity, category_id, category_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [name, description, price, totalStock, categoryId, category_name]
        );
        const productId = productRes.rows[0].id;

        // 3. Enregistrer le prix initial
        await client.query(
            "INSERT INTO price_history (product_id, new_price, type) VALUES ($1, $2, 'sale')",
            [productId, price]
        );

        // 4. Enregistrer le mouvement de stock initial
        if (totalStock > 0) {
            await client.query(
                "INSERT INTO stock_movements (product_id, type, quantity, old_stock, new_stock, reason) VALUES ($1, $2, $3, $4, $5, $6)",
                [productId, 'in', totalStock, 0, totalStock, 'Stock initial']
            );
        }

        // 5. Insérer les variantes
        if (variants && variants.length > 0) {
            for (const v of variants) {
                await client.query(
                    "INSERT INTO product_variants (product_id, variant_name, stock_quantity) VALUES ($1, $2, $3)",
                    [productId, v.name, v.stock]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "Produit créé avec succès", id: productId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
};

// Mettre à jour
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, stock_quantity, reason } = req.body;
    const userId = req.user?.id;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Récupérer les anciennes valeurs
        const oldProductRes = await client.query('SELECT price, stock_quantity FROM products WHERE id = $1', [id]);
        if (oldProductRes.rows.length === 0) throw new Error('Produit non trouvé');
        const oldProduct = oldProductRes.rows[0];

        // 1. Mise à jour prix si différent
        if (parseFloat(oldProduct.price) !== parseFloat(price)) {
            await client.query(
                "INSERT INTO price_history (product_id, old_price, new_price, type, changed_by) VALUES ($1, $2, $3, 'sale', $4)",
                [id, oldProduct.price, price, userId]
            );
        }

        // 2. Mise à jour stock si différent
        if (parseInt(oldProduct.stock_quantity) !== parseInt(stock_quantity)) {
            const diff = parseInt(stock_quantity) - parseInt(oldProduct.stock_quantity);
            const type = diff > 0 ? 'adjustment_in' : 'adjustment_out';
            await client.query(
                "INSERT INTO stock_movements (product_id, user_id, type, quantity, old_stock, new_stock, reason) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                [id, userId, type, Math.abs(diff), oldProduct.stock_quantity, stock_quantity, reason || 'Mise à jour manuelle']
            );
        }

        // 3. Update SQL
        await client.query(
            "UPDATE products SET name = $1, price = $2, stock_quantity = $3 WHERE id = $4",
            [name, price, stock_quantity, id]
        );

        await client.query('COMMIT');
        res.json({ message: "Produit mis à jour" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM products WHERE id = $1", [id]);
        res.json({ message: "Produit supprimé" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
