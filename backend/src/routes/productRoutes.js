const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/authMiddleware');

// @route   GET api/products
// @desc    Get all products
// @access  Public (or Private)
router.get('/', productController.getProducts);

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST api/products
// @desc    Create a product
// @access  Private (Admin/Manager)
router.post('/', auth, productController.createProduct);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', auth, productController.updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
