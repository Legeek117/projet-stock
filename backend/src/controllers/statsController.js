const { pool } = require('../config/db');

exports.getAdminStats = async (req, res) => {
    try {
        // 1. Chiffre d'Affaires Total
        // Note: La colonne s'appelle total_amount dans orders
        const caResult = await pool.query("SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled'");
        const totalRevenue = caResult.rows[0].total || 0;

        // 2. Ventes du jour
        const today = new Date().toISOString().split('T')[0];
        const salesTodayResult = await pool.query(
            "SELECT COUNT(*) as count, SUM(total_amount) as total FROM orders WHERE DATE(created_at) = $1 AND status != 'cancelled'",
            [today]
        );
        const salesToday = salesTodayResult.rows[0];

        // 3. Produits en stock
        const productsResult = await pool.query("SELECT COUNT(*) as count FROM products");
        const totalProducts = productsResult.rows[0].count;

        // 4. Produits en rupture (< 5)
        const lowStockResult = await pool.query("SELECT COUNT(*) as count FROM products WHERE stock_quantity < 5");
        const lowStockCount = lowStockResult.rows[0].count;

        // 5. Graphique 7 derniers jours (Simplifié)
        // On récupère les ventes groupées par jour sur les 7 derniers jours
        const chartResult = await pool.query(`
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
        const salesTodayResult = await pool.query(
            "SELECT COUNT(*) as count, SUM(total_amount) as total FROM orders WHERE user_id = $1 AND DATE(created_at) = $2 AND status != 'cancelled'",
            [userId, today]
        );

        // Ventes de la semaine
        const salesWeekResult = await pool.query(
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

// GET /api/stats/sales-chart?period=7
exports.getSalesChart = async (req, res) => {
    try {
        const period = parseInt(req.query.period) || 7;
        const userId = req.user.role === 'admin' ? null : req.user.id;

        let query = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count,
                SUM(total_amount) as total
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '${period} days'
        `;

        if (userId) {
            query += ` AND user_id = $1`;
        }

        query += ` GROUP BY DATE(created_at) ORDER BY date ASC`;

        const result = userId
            ? await pool.query(query, [userId])
            : await pool.query(query);

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// GET /api/stats/top-products?limit=10
exports.getTopProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.user.role === 'admin' ? null : req.user.id;

        let query = `
            SELECT 
                p.id,
                p.name,
                p.category_name,
                SUM(oi.quantity) as total_sold,
                SUM(oi.quantity * oi.unit_price) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
        `;

        if (userId) {
            query += ` WHERE o.user_id = $1`;
        }

        query += `
            GROUP BY p.id, p.name, p.category_name
            ORDER BY total_sold DESC
            LIMIT $${userId ? 2 : 1}
        `;

        const result = userId
            ? await pool.query(query, [userId, limit])
            : await pool.query(query, [limit]);

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// GET /api/stats/by-category
exports.getSalesByCategory = async (req, res) => {
    try {
        const userId = req.user.role === 'admin' ? null : req.user.id;

        let query = `
            SELECT 
                COALESCE(p.category_name, 'Sans catégorie') as category,
                COUNT(DISTINCT o.id) as order_count,
                SUM(oi.quantity) as items_sold,
                SUM(oi.quantity * oi.unit_price) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
        `;

        if (userId) {
            query += ` WHERE o.user_id = $1`;
        }

        query += `
            GROUP BY p.category_name
            ORDER BY revenue DESC
        `;

        const result = userId
            ? await pool.query(query, [userId])
            : await pool.query(query);

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// GET /api/stats/comparisons
exports.getComparisons = async (req, res) => {
    try {
        const userId = req.user.role === 'admin' ? null : req.user.id;

        const todayQuery = `
            SELECT 
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as total
            FROM orders
            WHERE DATE(created_at) = CURRENT_DATE
            ${userId ? 'AND user_id = $1' : ''}
        `;

        const yesterdayQuery = `
            SELECT 
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as total
            FROM orders
            WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
            ${userId ? 'AND user_id = $1' : ''}
        `;

        const thisMonthQuery = `
            SELECT 
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as total
            FROM orders
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
            ${userId ? 'AND user_id = $1' : ''}
        `;

        const lastMonthQuery = `
            SELECT 
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as total
            FROM orders
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            ${userId ? 'AND user_id = $1' : ''}
        `;

        const params = userId ? [userId] : [];

        const [today, yesterday, thisMonth, lastMonth] = await Promise.all([
            pool.query(todayQuery, params),
            pool.query(yesterdayQuery, params),
            pool.query(thisMonthQuery, params),
            pool.query(lastMonthQuery, params)
        ]);

        res.json({
            today: today.rows[0],
            yesterday: yesterday.rows[0],
            thisMonth: thisMonth.rows[0],
            lastMonth: lastMonth.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
