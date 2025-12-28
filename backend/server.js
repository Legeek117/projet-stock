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
app.use('/api/stock', require('./src/routes/stockRoutes'));
app.use('/api/purchases', require('./src/routes/purchaseRoutes'));
app.use('/api/settings', require('./src/routes/settingsRoutes'));
app.use('/api', require('./src/routes/adminRoutes'));

// Basic Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'OptiStock API is running', version: '1.2.0' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Stock Management API' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
