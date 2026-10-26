import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocket } from './sockets/index.js';

async function startServer() {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Connectify Backend Server Running`);
    console.log(`📡 URL: http://localhost:${env.PORT}`);
    console.log(`🛡️ Environment: ${env.NODE_ENV}`);
    console.log(`🔌 Health check: http://localhost:${env.PORT}/api/health`);
    console.log(`==================================================\n`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Closing HTTP server and database...`);
    server.close(async () => {
      await disconnectDB();
      console.log('Server stopped gracefully.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
