const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const zoneRoutes = require('./routes/zone.routes');
const workOrderRoutes = require('./routes/workOrder.routes');
const flightRoutes = require('./routes/flight.routes');
const projectLifecycleRoutes = require('./routes/projectLifecycle.routes');
const workOrderLifecycleRoutes = require('./routes/workOrderLifecycle.routes');
const fileStorageRoutes = require('./routes/fileStorage.routes');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Middleware
// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://drone-ops-manager.windsurf.build', 'https://drone-ops-manager.onrender.com']
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/workorders', workOrderRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/lifecycle', projectLifecycleRoutes);
app.use('/api/wo-lifecycle', workOrderLifecycleRoutes);
app.use('/api/files', fileStorageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve frontend static files
  const staticPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(staticPath));
  
  // For any route not handled by API, serve the React app
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(staticPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || config.server.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || config.server.env} mode`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Running in production mode on Render.com`);
  }
});

module.exports = app;
