const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware'); // Authentification JWT
const checkRole = require('../middlewares/roleMiddleware'); // Vérification Admin

const statsController = require('../controllers/statsController');
const userController = require('../controllers/userController');

// --- STATS ---
// Stats Admin (Globales)
router.get('/stats/admin', auth, checkRole('admin'), statsController.getAdminStats);
// Stats User (Personnelles) - Pas besoin de checkRole admin, juste être authentifié
router.get('/stats/user', auth, statsController.getUserStats);

// Nouvelles routes analytics (accessibles selon le rôle)
router.get('/stats/sales-chart', auth, statsController.getSalesChart);
router.get('/stats/top-products', auth, statsController.getTopProducts);
router.get('/stats/by-category', auth, statsController.getSalesByCategory);
router.get('/stats/comparisons', auth, statsController.getComparisons);


// --- USERS MANAGEMENT (Admin Only) ---
router.get('/users', auth, checkRole('admin'), userController.getAllUsers);
router.post('/users', auth, checkRole('admin'), userController.createUser);
router.delete('/users/:id', auth, checkRole('admin'), userController.deleteUser);

module.exports = router;
