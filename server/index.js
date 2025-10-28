import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import authRouter from './routes/auth.js';
import servicesRouter from './routes/services.js';
import bookingsRouter from './routes/bookings.js';
import emergencyRouter from './routes/emergency.js';
import walletRouter from './routes/wallet.js';
import videoConsultationsRouter from './routes/video-consultations.js';
import costEstimatorRouter from './routes/cost-estimator.js';
import communityRouter from './routes/community.js';
import { dbFallback, getDatabaseStatus } from './utils/dbFallback.js';
import database from './config/database.js';

// Ensure .env is loaded from the server directory regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003', // Frontend dev server
    'http://localhost:5173', // Vite default
    'https://your-frontend-domain.com' // Add your production domain
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database fallback middleware
app.use(dbFallback);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/video-consultations', videoConsultationsRouter);
app.use('/api/cost-estimator', costEstimatorRouter);
app.use('/api/community', communityRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  
  res.json({ 
    status: 'OK', 
    message: 'RahaSeva Backend API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: {
      status: dbStatus.status,
      using: dbStatus.using,
      isConnected: dbStatus.isConnected
    }
  });
});

// Default route
app.get('/', (req, res) => {
  const dbStatus = getDatabaseStatus();
  
  res.json({
    message: 'Welcome to RahaSeva API',
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      bookings: '/api/bookings',
      emergency: '/api/emergency',
      wallet: '/api/wallet',
      videoConsultations: '/api/video-consultations',
      costEstimator: '/api/cost-estimator',
      community: '/api/community',
      health: '/health'
    },
    database: {
      status: dbStatus.status,
      using: dbStatus.using
    },
    docs: 'API documentation coming soon'
  });
});

// Initialize database connection with retry logic
database.connectToMongoDB((isConnected) => {
  if (isConnected) {
    console.log('✅ MongoDB connected successfully to Atlas');
    console.log('📊 Database:', database.mongoose.connection.db.databaseName);
  } else {
    console.log('❌ MongoDB connection failed after multiple attempts');
    console.log('⚠️  Server will continue running with limited functionality (using mock data)');
  }
});

// Setup database event listeners
// Setup database event listeners
database.setupDatabaseEventListeners();

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Graceful shutdown is handled by database.js

app.listen(PORT, () => {
  console.log(`🚀 RahaSeva Backend Server is running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});
