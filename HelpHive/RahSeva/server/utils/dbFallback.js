/**
 * Database Fallback Middleware
 * 
 * This middleware checks the MongoDB connection status and provides
 * fallback functionality when the database is not available.
 */

import mongoose from 'mongoose';
import mockDataStore from './MockData.js';

// Track database connection state
let isMongoConnected = false;

// Update connection state based on mongoose connection
mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  console.log('📊 Database Fallback Middleware: MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.log('📊 Database Fallback Middleware: MongoDB disconnected - Using mock data');
});

mongoose.connection.on('error', () => {
  isMongoConnected = false;
  console.log('📊 Database Fallback Middleware: MongoDB error - Using mock data');
});

/**
 * Provides mock data if MongoDB is not connected
 */
export const dbFallback = (req, res, next) => {
  // Attach connection status to request
  req.isMongoConnected = isMongoConnected;
  
  // Attach mockDataStore to request for controllers to use if needed
  req.mockDataStore = mockDataStore;
  
  // Proceed with request processing
  next();
};

/**
 * Gets database status
 */
export const getDatabaseStatus = () => {
  return {
    isConnected: isMongoConnected,
    connectionState: mongoose.connection.readyState,
    status: isMongoConnected ? 'connected' : 'disconnected',
    using: isMongoConnected ? 'mongodb' : 'mock-data'
  };
};
