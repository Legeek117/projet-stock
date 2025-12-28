const { pool } = require('../config/db');

exports.getPreferences = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            // Créer des préférences par défaut si elles n'existent pas
            const insertResult = await pool.query(
                'INSERT INTO user_preferences (user_id) VALUES ($1) RETURNING *',
                [req.user.id]
            );
            return res.json(insertResult.rows[0]);
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updatePreferences = async (req, res) => {
    const { primary_color, dark_mode, compact_view } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO user_preferences (user_id, primary_color, dark_mode, compact_view, updated_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id) DO UPDATE SET
             primary_color = EXCLUDED.primary_color,
             dark_mode = EXCLUDED.dark_mode,
             compact_view = EXCLUDED.compact_view,
             updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [req.user.id, primary_color, dark_mode, compact_view]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
