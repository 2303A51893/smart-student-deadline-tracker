/**
 * Server Entrypoint
 * Initializes database schema and binds HTTP server to port.
 */

require('dotenv').config();
const app = require('./app');
const { initDb, close } = require('./db');

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  console.log('----------------------------------------------------');
  console.log('🚀 DeadlineWise: Smart Student Deadline Tracker');
  console.log('----------------------------------------------------');

  // Attempt database schema initialization
  try {
    const initResult = await initDb();
    console.log(`[Database]: ${initResult.message}`);
  } catch (err) {
    console.warn('[Database]: Initial connection warning:', err.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server]: REST API active and listening on port ${PORT}`);
    console.log(`[Health]: http://localhost:${PORT}/api/health`);
    console.log(`[Tasks] : http://localhost:${PORT}/api/tasks`);
    console.log('----------------------------------------------------');
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[Server]: Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('[Server]: HTTP server closed.');
      await close();
      console.log('[Database]: Database pool closed.');
      process.exit(0);
    });

    // Force shutdown after timeout if pending connections hang
    setTimeout(() => {
      console.error('[Server]: Forcefully shutting down due to timeout.');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[Fatal Startup Error]:', err);
    process.exit(1);
  });
}

module.exports = { startServer };
