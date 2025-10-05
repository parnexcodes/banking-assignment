import { config } from 'dotenv';

// Load environment variables
config();

import app from './app';
import { db } from './utils/database';
import { databaseConfig } from './config/database';

const PORT = process.env.PORT || 3000;

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Initialize database connection
    console.log('Initializing database connection...');
    await db.initialize();
    console.log('Database connection established successfully');

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Banking API server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API docs: http://localhost:${PORT}/api`);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await db.close();
          console.log('Database connection closed');
          process.exit(0);
        } catch (error) {
          console.error('Error closing database connection:', error);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();