import { Sequelize, Options } from 'sequelize';

function parseDatabaseConfig(): Options {
  console.log('Inside database.ts');
  const provider = process.env.DB_PROVIDER || 'local';

  const isAzure = provider === 'azure';

  const host = isAzure
    ? process.env.AZURE_DB_HOST
    : process.env.LOCAL_DB_HOST;

  const port = Number(
    isAzure
      ? process.env.AZURE_DB_PORT
      : process.env.LOCAL_DB_PORT
  ) || 1433;

  const database = isAzure
    ? process.env.AZURE_DB_NAME
    : process.env.LOCAL_DB_NAME;

  const username = isAzure
    ? process.env.AZURE_DB_USER
    : process.env.LOCAL_DB_USER;

  const password = isAzure
    ? process.env.AZURE_DB_PASSWORD
    : process.env.LOCAL_DB_PASSWORD;

  const encrypt = (isAzure
    ? process.env.AZURE_DB_ENCRYPT
    : process.env.LOCAL_DB_ENCRYPT) === 'true';

  const trustServerCertificate = (isAzure
    ? process.env.AZURE_DB_TRUST_SERVER_CERT
    : process.env.LOCAL_DB_TRUST_SERVER_CERT) === 'true';

  if (!host || !database || !username) {
    const missingVars: string[] = [];
    if (!host) missingVars.push(isAzure ? 'AZURE_DB_HOST' : 'LOCAL_DB_HOST');
    if (!database) missingVars.push(isAzure ? 'AZURE_DB_NAME' : 'LOCAL_DB_NAME');
    if (!username) missingVars.push(isAzure ? 'AZURE_DB_USER' : 'LOCAL_DB_USER');
    
    throw new Error(
      `Database environment variables are missing: ${missingVars.join(', ')}\n` +
      `Required for ${provider} provider:\n` +
      `  - ${isAzure ? 'AZURE' : 'LOCAL'}_DB_HOST\n` +
      `  - ${isAzure ? 'AZURE' : 'LOCAL'}_DB_NAME\n` +
      `  - ${isAzure ? 'AZURE' : 'LOCAL'}_DB_USER\n` +
      `  - ${isAzure ? 'AZURE' : 'LOCAL'}_DB_PASSWORD\n` +
      `Optional: ${isAzure ? 'AZURE' : 'LOCAL'}_DB_PORT, ${isAzure ? 'AZURE' : 'LOCAL'}_DB_ENCRYPT, ${isAzure ? 'AZURE' : 'LOCAL'}_DB_TRUST_SERVER_CERT`
    );
  }

  console.log(`🗄️ Connecting to ${provider.toUpperCase()} SQL → ${host}/${database}`);

  return {
    dialect: 'mssql',
    host,
    port,
    database,
    username,
    password,
    define: {
      schema: 'dbo',
    },
    dialectOptions: {
      options: {
      encrypt: false,                 // true ONLY for Azure SQL
      trustServerCertificate: true,
      connectTimeout: 5000,
        enableArithAbort: true,
      },
    },
    pool: {
      max: Number(process.env.DB_POOL_MAX || 10),
      min: Number(process.env.DB_POOL_MIN || 0),
      idle: Number(process.env.DB_POOL_IDLE_TIMEOUT || 30000),
    },
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  };
}

// Lazy initialization of Sequelize instance
let sequelizeInstance: Sequelize | null = null;

/**
 * Ensure the target database exists (local provider only).
 * Connects to master and runs CREATE DATABASE if not exists.
 */
export async function ensureDatabaseExists(): Promise<void> {
  const provider = process.env.DB_PROVIDER || 'local';
  if (provider !== 'local') return;

  const dbName = process.env.LOCAL_DB_NAME;
  if (!dbName) return;

  const config = parseDatabaseConfig();
  const masterSequelize = new Sequelize({ ...config, database: 'master' });

  try {
    await masterSequelize.authenticate();
    const literalName = dbName.replace(/'/g, "''");
    const bracketName = '[' + dbName.replace(/\]/g, ']]') + ']';
    await masterSequelize.query(
      `IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'${literalName}') CREATE DATABASE ${bracketName}`
    );
    console.log(`✅ Database "${dbName}" exists or was created`);
  } finally {
    await masterSequelize.close();
  }
}

/**
 * Get or create Sequelize instance (lazy initialization)
 * Only creates the instance when actually needed
 */
export function getSequelize(): Sequelize {
  console.log('Inside getSequelize');
  if (!sequelizeInstance) {
    const USE_DATABASE = process.env.USE_DATABASE === 'true';
    console.log('Inside USE_DATABASE', USE_DATABASE);
    if (!USE_DATABASE) {
      throw new Error(
        'Database is not enabled. Set USE_DATABASE=true and configure database environment variables.'
      );
    }
    
    try {
      console.log('Inside getSequelize TRY block');
      sequelizeInstance = new Sequelize(parseDatabaseConfig());
    } catch (error) {
      // Safe error handling - check if error is an Error object
      let errorMessage = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      throw new Error(`Failed to initialize Sequelize: ${errorMessage}`);
    }
  }
  
  return sequelizeInstance;
}

/**
 * Export sequelize for backward compatibility
 * Uses a Proxy to lazy-load the instance only when accessed
 * This allows models to import sequelize without immediately initializing it
 */
export const sequelize = new Proxy({} as Sequelize, {
  get(_target, prop) {
    try {
      const instance = getSequelize();
      const value = instance[prop as keyof Sequelize];
      
      // If it's a function, bind it to the instance
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      
      return value;
    } catch (error) {
      // If getSequelize fails (e.g., USE_DATABASE=false), throw a clearer error
      if (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf') {
        return () => '[Sequelize instance not initialized]';
      }
      throw error;
    }
  },
  set(_target, prop, value) {
    try {
      const instance = getSequelize();
      (instance as any)[prop] = value;
      return true;
    } catch (error) {
      throw error;
    }
  },
});

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const instance = getSequelize();
    await instance.authenticate();
    console.log('✅ SQL Server connection established via Sequelize');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to SQL Server:', error);
    return false;
  }
}

// Graceful shutdown
async function shutdown() {
  if (sequelizeInstance) {
    try {
      await sequelizeInstance.close();
      console.log('SQL Server connection closed');
    } catch (error) {
      console.error('Error closing SQL Server connection:', error);
    }
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('beforeExit', shutdown);
