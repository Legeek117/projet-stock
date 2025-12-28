const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const stockController = require('../controllers/stockController');

// Mouvements de stock
router.get('/movements', auth, stockController.getMovements);
router.post('/movements', auth, stockController.createMovement); // Tout le monde peut enregistrer un mouvement (vente/perte)

// Historique des prix
router.get('/price-history/:product_id', auth, stockController.getPriceHistory);

// Alertes
router.get('/alerts/low-stock', auth, stockController.getLowStockAlerts);

module.exports = router;
