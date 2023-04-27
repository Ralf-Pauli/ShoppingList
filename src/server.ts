import expressApp from './app';
import { pool } from './services/Database';

const DEFAULT_PORT = 3000;
const port = process.env.PORT || DEFAULT_PORT;

const server = expressApp.listen(port, () => {
  pool.connect()
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((error) => {
      console.error("Error connecting to DB:", error);
      process.exit(1);
    });
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error("Server encountered an error:", error);
  process.exit(1);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function shutdown() {
  console.log('Closing connection pool...');
  await pool.end();
  console.log('Connection pool closed');

  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
}