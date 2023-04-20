import app from './app';
import { pool } from './services/database';

const port = process.env.PORT || 4000;


const server = app.listen(port, () => {
  pool.connect();
  console.log("Connected to DB");
  
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// Close the connection pool when shutting down the server
process.on('SIGINT', async () => {
  console.log('Closing connection pool...');
  await pool.end();
  console.log('Connection pool closed');

  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('Closing connection pool...');
  await pool.end();
  console.log('Connection pool closed');

  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});