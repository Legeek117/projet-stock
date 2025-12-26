require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api', require('./routes/adminRoutes')); // Routes génériques (/stats, /users)

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Stock Management API' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
