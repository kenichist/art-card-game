// --- START OF FILE server.js ---

const express = require('express');
const cors = require('cors');
const path = require('path'); // <<< CORRECTED LINE
const connectDB = require('./db'); // Assuming db.js exports the connect function
const multer = require('multer'); // Import multer for error handling check
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- UPDATED Static File Serving ---
// Serve the entire 'public' folder. Files inside 'public/uploads/items'
// will be accessible via URLs starting with '/uploads/items/...'
// Example: http://localhost:5000/uploads/items/image-123.jpg
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const itemRoutes = require('./routes/itemRoutes');
const collectorRoutes = require('./routes/collectorRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const seedRoutes = require('./routes/seedRoutes');

// Use routes
app.use('/api/items', itemRoutes);
app.use('/api/collectors', collectorRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/seed', seedRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// --- Central Error Handling Middleware ---
// Place this AFTER all your routes
app.use((err, req, res, next) => {
    console.error("Error Handler Caught:", err.message);
    // Log stack in development for easier debugging
    // if (process.env.NODE_ENV === 'development') {
    //     console.error(err.stack);
    // }

    // Handle Multer errors specifically
    if (err instanceof multer.MulterError) {
        // e.g., err.code === 'LIMIT_FILE_SIZE'
        return res.status(400).json({ message: `File Upload Error: ${err.message} (Code: ${err.code})` });
    }

    // Handle custom errors passed via next(err) e.g. from fileFilter or controllers
    // Check for a status code attached to the error, otherwise default to 500
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: err.message || 'An unexpected server error occurred.',
        // Optionally include status code in response body
        // status: statusCode
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// --- END OF FILE server.js ---