const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const auth = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// Toutes les routes d'achat nécessitent d'être connecté
router.use(auth);

// Fournisseurs
router.get('/suppliers', purchaseController.getSuppliers);
router.post('/suppliers', checkRole('admin'), purchaseController.createSupplier);

// Achats
router.get('/', checkRole('admin'), purchaseController.getPurchases);
router.post('/', checkRole('admin'), purchaseController.createPurchase);

module.exports = router;
