const db = require('../config/db');

exports.getAllCategories = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM categories ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createCategory = async (req, res) => {
    const { name } = req.body;
    try {
        // Vérifier si existe
        const check = await db.query("SELECT * FROM categories WHERE name = $1", [name]);
        if (check.rows.length > 0) {
            return res.json(check.rows[0]); // Retourne l'existante
        }

        const result = await db.query(
            "INSERT INTO categories (name) VALUES ($1) RETURNING *",
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
