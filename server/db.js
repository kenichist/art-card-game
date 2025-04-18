const mongoose = require('mongoose');
require('dotenv').config();

// Cache the database connection
let cachedConnection = null;

const connectDB = async () => {
  // If we already have a connection, use it
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    // Set strictQuery for Mongoose 7+ compatibility
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/art-card-game', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // These options help with serverless environments
      bufferCommands: false,
      maxPoolSize: 10, // Reduce from the default of 100
      serverSelectionTimeoutMS: 5000
    });

    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't exit process in serverless environments
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
