const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/authMiddleware');

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, orderController.createOrder);

// @route   GET api/orders
// @desc    Get user orders
// @access  Private
router.get('/', auth, orderController.getOrders);

module.exports = router;
