const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories', categoryController.getAllCategories);

// Protected routes (Admin Only)
router.post('/', auth, checkRole('admin'), productController.createProduct);
router.put('/:id', auth, checkRole('admin'), productController.updateProduct);
router.delete('/:id', auth, checkRole('admin'), productController.deleteProduct);

module.exports = router;
