// --- START OF FILE server.js ---

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const multer = require('multer');
require('dotenv').config(); 

// Connect to database (Ensure DATABASE_URL env var is set in Vercel)
connectDB();

const app = express();

// Middleware
app.use(cors()); // Consider configuring CORS more restrictively for production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static File Serving (from server/public directory) ---
// IMPORTANT: Do NOT rely on saving user uploads here in Vercel's serverless environment. Use external storage.
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const itemRoutes = require('./routes/itemRoutes');
const collectorRoutes = require('./routes/collectorRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const seedRoutes = require('./routes/seedRoutes');

app.use('/api/items', itemRoutes);
app.use('/api/collectors', collectorRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/seed', seedRoutes);

app.use((err, req, res, next) => {
    console.error("Error Handler Caught:", err.message);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `File Upload Error: ${err.message} (Code: ${err.code})` });
    }

    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: err.message || 'An unexpected server error occurred.',
    });
});


module.exports = app;

