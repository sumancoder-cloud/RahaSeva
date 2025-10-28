/**
 * MongoDB Connection Manager
 * 
 * Handles MongoDB connection with retry logic and better error handling
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabaseStatus } from '../utils/dbFallback.js';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Maximum number of connection attempts
const MAX_RETRY_ATTEMPTS = 5;
let retryCount = 0;
let retryTimeout = null;

// Connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // 10 seconds for initial connection attempt
  socketTimeoutMS: 45000, // 45 seconds
  maxPoolSize: 10,
  connectTimeoutMS: 10000, // 10 seconds
  retryWrites: true,
  retryReads: true
};

/**
 * Connect to MongoDB with retry logic
 */
export const connectToMongoDB = async (callback) => {
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    console.log('⚠️  Server will continue running with mock data');
    if (callback) callback(false);
    return;
  }
  
  try {
    await mongoose.connect(mongoURI, mongooseOptions);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    
    // Reset retry count on successful connection
    retryCount = 0;
    
    if (callback) callback(true);
    
    return true;
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    
    // Clear any existing retry timeout
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
    
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      // Exponential backoff: 2^retryCount seconds (1s, 2s, 4s, 8s, 16s)
      const retryDelay = Math.pow(2, retryCount) * 1000;
      retryCount++;
      
      console.log(`🔄 Retrying connection (${retryCount}/${MAX_RETRY_ATTEMPTS}) in ${retryDelay/1000}s...`);
      
      // Schedule retry
      retryTimeout = setTimeout(() => {
        connectToMongoDB(callback);
      }, retryDelay);
    } else {
      console.error(`❌ Failed to connect after ${MAX_RETRY_ATTEMPTS} attempts`);
      console.log('⚠️  Server will continue running with mock data');
      
      if (callback) callback(false);
    }
    
    return false;
  }
};

/**
 * Setup database event listeners
 */
export const setupDatabaseEventListeners = () => {
  // Connection events
  mongoose.connection.on('connected', () => {
    console.log('📊 MongoDB connected event fired');
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('🔌 MongoDB disconnected');
    
    // Check if we should attempt reconnection
    const dbStatus = getDatabaseStatus();
    if (!dbStatus.isConnected && retryCount === 0) {
      console.log('🔄 Attempting to reconnect to MongoDB...');
      connectToMongoDB();
    }
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('⚠️  MongoDB connection error:', err.message);
  });
  
  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected - Database functionality restored');
  });
  
  // Process events
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGQUIT', gracefulShutdown);
};

/**
 * Handle graceful shutdown
 */
const gracefulShutdown = () => {
  console.log('🛑 Shutdown signal received, closing MongoDB connection');
  
  // Clear any retry timeout
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }
  
  // Close MongoDB connection
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close(() => {
      console.log('📊 MongoDB connection closed through app termination');
      process.exit(0);
    });
  } else {
    console.log('📊 MongoDB connection was not open');
    process.exit(0);
  }
};

// Export default object with all functions
export default {
  connectToMongoDB,
  setupDatabaseEventListeners,
  mongoose
};
