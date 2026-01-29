/// <reference path="./types/express.d.ts" />
// Load environment variables from .env file
import 'dotenv/config';

import * as http from 'http';
import repoApp from './app';
import { initializeDatabase } from './config/database-init';
import { ensureDatabaseExists } from './config/database';

const PORT = Number(process.env.PORT) || 3001;

async function startServer() {
  // Initialize database schema (code-first approach)
  const USE_DATABASE = process.env.USE_DATABASE === 'true';
  const DISABLE_DB_INIT = process.env.DISABLE_DB_INIT === 'true';
  
  if (USE_DATABASE && !DISABLE_DB_INIT) {
    const maxAttempts = 5;
    const delayMs = 3000;
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`Database init attempt ${attempt}/${maxAttempts}...`);
        }
        await ensureDatabaseExists();
        await initializeDatabase();
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        console.error(`Database initialization failed (attempt ${attempt}/${maxAttempts}):`, error);
        if (attempt < maxAttempts) {
          console.log(`Retrying in ${delayMs / 1000}s...`);
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    }
    if (lastError) {
      console.error('Tables were NOT created. Fix the error above and restart.');
      console.error('Set DISABLE_DB_INIT=true to skip initialization (not recommended).');
      process.exit(1);
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