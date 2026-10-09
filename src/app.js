/**
 * Express Application Configuration
 * Exports configured Express app without starting listener.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const healthRoutes = require('./routes/healthRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// ==============================================================================
// 1. Security & Core Middleware
// ==============================================================================

// Basic Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS configuration (allow client in dev or production same-origin)
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
      if (!origin || origin === allowedOrigin || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser with strict payload limit
app.use(express.json({ limit: '100kb' }));

// Simple Request Logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
  }
  next();
});

// ==============================================================================
// 2. API Routes
// ==============================================================================
app.use('/api', healthRoutes);
app.use('/api/tasks', taskRoutes);

// Root API Welcome / Info Route
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to DeadlineWise REST API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      devops: '/api/devops/status',
      tasks: '/api/tasks',
      seed: '/api/tasks/seed',
    },
  });
});

// ==============================================================================
// 3. Frontend Static Asset Serving (Production Mode)
// ==============================================================================
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ==============================================================================
// 4. Error Handling
// ==============================================================================

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Unhandled Server Error]:', err);
  }

  // Handle syntax error from malformed JSON payloads
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON payload format.',
    });
  }

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(statusCode).json({
    success: false,
    error: isProduction ? 'An unexpected internal server error occurred.' : err.message || 'Server Error',
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

module.exports = app;
