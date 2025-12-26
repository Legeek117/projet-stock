const db = require('../config/db');

exports.getAdminStats = async (req, res) => {
    try {
        // 1. Chiffre d'Affaires Total
        // Note: La colonne s'appelle total_amount dans orders
        const caResult = await db.query("SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled'");
        const totalRevenue = caResult.rows[0].total || 0;

        // 2. Ventes du jour
        const today = new Date().toISOString().split('T')[0];
        const salesTodayResult = await db.query(
            "SELECT COUNT(*) as count, SUM(total_amount) as total FROM orders WHERE DATE(created_at) = $1 AND status != 'cancelled'",
            [today]
        );
        const salesToday = salesTodayResult.rows[0];

        // 3. Produits en stock
        const productsResult = await db.query("SELECT COUNT(*) as count FROM products");
        const totalProducts = productsResult.rows[0].count;

        // 4. Produits en rupture (< 5)
        const lowStockResult = await db.query("SELECT COUNT(*) as count FROM products WHERE stock_quantity < 5");
        const lowStockCount = lowStockResult.rows[0].count;

        // 5. Graphique 7 derniers jours (Simplifié)
        // On récupère les ventes groupées par jour sur les 7 derniers jours
        const chartResult = await db.query(`
            SELECT to_char(created_at, 'YYYY-MM-DD') as date, SUM(total_amount) as total 
            FROM orders 
            WHERE created_at > NOW() - INTERVAL '7 days' AND status != 'cancelled'
            GROUP BY date 
            ORDER BY date
        `);

        res.json({
            totalRevenue,
            salesToday: { count: salesToday.count, total: salesToday.total || 0 },
            totalProducts,
            lowStockCount,
            salesChart: chartResult.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        // Ventes du jour (User)
        const salesTodayResult = await db.query(
            "SELECT COUNT(*) as count, SUM(total_amount) as total FROM orders WHERE user_id = $1 AND DATE(created_at) = $2 AND status != 'cancelled'",
            [userId, today]
        );

        // Ventes de la semaine
        const salesWeekResult = await db.query(
            "SELECT COUNT(*) as count, SUM(total_amount) as total FROM orders WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days' AND status != 'cancelled'",
            [userId]
        );

        res.json({
            salesToday: salesTodayResult.rows[0],
            salesWeek: salesWeekResult.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
