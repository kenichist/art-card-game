// --- START OF FILE server.js ---

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const multer = require('multer');
const dotenv = require('dotenv');
const { ensurePublicDirectories } = require('./services/fileSystemService');

// Load environment variables
dotenv.config(); 

// Connect to database (ensure MongoDB connection is properly configured in Vercel)
if (process.env.NODE_ENV === 'production') {
  // Only try to connect if not in a serverless environment
  // or use a connection pooling solution for serverless
  connectDB().catch(err => console.error('Database connection error:', err));
} else {
  connectDB();
}

const app = express();

// Middleware
app.use(cors()); // Consider configuring CORS more restrictively for production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static File Serving (from server/public directory) ---
// IMPORTANT: In Vercel, static assets should be served through Vercel's CDN
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize file system directories in development only
if (process.env.NODE_ENV !== 'production') {
  ensurePublicDirectories();
}

// Import routes
const itemRoutes = require('./routes/itemRoutes');
const collectorRoutes = require('./routes/collectorRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const seedRoutes = require('./routes/seedRoutes');

// API routes
app.use('/api/items', itemRoutes);
app.use('/api/collectors', collectorRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/seed', seedRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Error handling middleware
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

// Add port configuration
const port = process.env.PORT || 5000;

// Start the server if this file is run directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Images will be served from /images`);
    });
}

module.exports = app;

