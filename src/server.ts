import expressApp from './app';
import logger from './helpers/Logger';
import { pool } from './services/Database';
import { Server } from 'http';


const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.connect();
    logger.info("Connected to DB");

    const server = expressApp.listen(port, () => {
      logger.info(`[server]: Server is running at http://localhost:${port}`);
    });

    server.on('error', (error) => {
      logger.error("Server encountered an error:", error);
      process.exit(1);
    });

    process.on('SIGINT', () => shutdown(server));
    process.on('SIGTERM', () => shutdown(server));
  } catch (error) {
    logger.error("Error connecting to DB:", error);
    process.exit(1);
  }
}

async function shutdown(server: Server) {
  logger.info('Closing connection pool...');
  await pool.end();
  logger.info('Connection pool closed');

  server.close(() => {
    logger.info('Server stopped');
    process.exit(0);
  });
}

startServer();
