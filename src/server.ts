/// <reference path="./types/express.d.ts" />
// Load environment variables from .env file
import 'dotenv/config';

import * as http from 'http';
import repoApp from './app';
import { initializeDatabase } from './config/database-init';

const PORT = Number(process.env.PORT) || 3001;

async function startServer() {
  // Initialize database schema (code-first approach)
  const USE_DATABASE = process.env.USE_DATABASE === 'true';
  const DISABLE_DB_INIT = process.env.DISABLE_DB_INIT === 'true';
  
  if (USE_DATABASE && !DISABLE_DB_INIT) {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error('Database initialization failed:', error);
      console.error('Server will continue, but database operations may fail');
      console.error('Set DISABLE_DB_INIT=true to skip initialization');
      console.error('Or set USE_DATABASE=false to use in-memory repositories');
    }
  } else if (USE_DATABASE && DISABLE_DB_INIT) {
    console.log('Database auto-initialization is disabled (DISABLE_DB_INIT=true)');
  } else if (!USE_DATABASE) {
    console.log('Using in-memory repositories (USE_DATABASE is not set to true)');
  }

  const app = repoApp();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});