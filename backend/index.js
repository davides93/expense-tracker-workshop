const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories');
const budgetRoutes = require('./routes/budgets');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.disable('x-powered-by');
app.use((req, res, next) => {
  // Security headers to harden API response
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    const dbResult = await db.query('SELECT 1 as status');
    const dbStatus = dbResult.rows[0]?.status === 1 ? 'healthy' : 'unhealthy';
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      uptime: process.uptime()
    });
  }
});

// Readiness check endpoint
app.get('/ready', async (req, res) => {
  try {
    // Check if essential services are ready
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not ready', timestamp: new Date().toISOString() });
  }
});

// API Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/stats', statsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Safe logging without exposing stack traces in API responses
  console.error('Unhandled server error:', err.message || err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Expense Tracker API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'No connection string'}`);
});

module.exports = app;