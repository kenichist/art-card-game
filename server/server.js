const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
