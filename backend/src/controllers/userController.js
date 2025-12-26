const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        // On ne renvoie pas les hash de mot de passe !
        const result = await db.query("SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;
    // Note: Seul un admin appellera cette route, donc on force le rôle 'user' (employé)
    // Ou on laisse le choix ? Spécifications disent "Rôle automatique : USER"

    try {
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const result = await db.query(
            "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING id, username, email, role, created_at",
            [username, email, hash]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Empêcher un admin de se supprimer lui-même
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: "Impossible de supprimer son propre compte" });
        }

        await db.query("DELETE FROM users WHERE id = $1", [id]);
        res.json({ message: "Utilisateur supprimé" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
