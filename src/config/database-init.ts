import { getSequelize } from '../config/database';
import { syncModels, testModels } from '../models/sequelize';
import { RoleModel } from '../models/sequelize';
import { randomUUID } from 'crypto';

/**
 * Code-First Database Initialization using Sequelize
 * Automatically creates tables and indexes on application startup
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database schema using Sequelize (code-first approach)...');
    
    // Test connection first
    const connected = await testModels();
    if (!connected) {
      const errorMsg = 
        'Failed to connect to database. Please check:\n' +
        '  1. SQL Server is running\n' +
        '  2. Database connection details are correct (check .env file)\n' +
        '  3. Network/firewall allows connection\n' +
        '  4. Database exists and user has permissions';
      throw new Error(errorMsg);
    }
    
    // Sync models (create tables if they don't exist)
    // force: false means it won't drop existing tables
    // alter: false means it won't modify existing tables
    await syncModels(false);
    
    // Create default roles if they don't exist
    await ensureDefaultRoles();
    
    // Verify and log tables so you can confirm in SSMS
    await logCreatedTables();
    
    console.log('Database schema initialization completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to initialize database schema:', errorMessage);
    
    // If it's a connection error, provide more helpful information
    if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ESOCKET')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('  - Verify SQL Server is running: Check Services or run "sqlcmd -L"');
      console.error('  - Check connection string in .env file');
      console.error('  - For local SQL Server, ensure TCP/IP is enabled');
      console.error('  - Try connecting with SQL Server Management Studio first');
      console.error('  - Set DISABLE_DB_INIT=true to skip initialization and use in-memory mode\n');
    }
    
    throw error;
  }
}

/**
 * Log tables created in the database and how to view them in SSMS
 */
async function logCreatedTables(): Promise<void> {
  const dbName = process.env.LOCAL_DB_NAME || process.env.AZURE_DB_NAME || 'myapp';
  const port = process.env.LOCAL_DB_PORT || process.env.AZURE_DB_PORT || '1433';
  try {
    const sequelize = getSequelize();
    const [tableRows] = await sequelize.query(
      "SELECT name FROM sys.tables WHERE type = 'U' ORDER BY name"
    ) as [Array<{ name: string }>, unknown];
    const tableList = Array.isArray(tableRows) ? tableRows.map((r) => r.name).join(', ') : 'unknown';
    const [serverRows] = await sequelize.query(
      "SELECT @@SERVERNAME AS server, DB_NAME() AS db"
    ) as [Array<{ server: string; db: string }>, unknown];
    const serverName = Array.isArray(serverRows) && serverRows[0] ? serverRows[0].server : '?';
    const actualDb = Array.isArray(serverRows) && serverRows[0] ? serverRows[0].db : '?';
    console.log(`✅ Tables in database "${actualDb}" (schema dbo): ${tableList}`);
    console.log(`   SQL Server instance name: ${serverName}`);
    console.log(`   To see these tables in SSMS on THIS machine:`);
    console.log(`   → Server name: localhost,${port}  or  127.0.0.1,${port}`);
    console.log(`   → Do NOT use: .\\SQLEXPRESS  or  (local)  or  PSILENL337  without ,${port}`);
    console.log(`   → Database: ${dbName}  →  Tables  →  dbo  →  right‑click Refresh`);
  } catch (e) {
    console.warn('Could not list tables:', e);
  }
}

/**
 * Ensure default roles exist in the database
 */
async function ensureDefaultRoles(): Promise<void> {
  try {
    const defaultRoles = [
      { name: 'user', description: 'Default user role' },
      { name: 'admin', description: 'Administrator role with full access' },
      { name: 'manager', description: 'Manager role with elevated permissions' },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await RoleModel.findOne({ where: { name: roleData.name } });
      if (!existingRole) {
        await RoleModel.create({
          id: randomUUID(),
          name: roleData.name,
          description: roleData.description,
        });
        console.log(`✅ Created default role: ${roleData.name}`);
      }
    }
  } catch (error) {
    console.warn('Failed to create default roles:', error);
    // Don't throw - roles can be created via API later
  }
}

/**
 * Check database connection and schema
 */
export async function checkDatabaseHealth(): Promise<{ connected: boolean; tablesExist: boolean }> {
  try {
    const connected = await testModels();
    if (!connected) {
      return {
        connected: false,
        tablesExist: false,
      };
    }

    // Check if tables exist by trying to query them
    const { UserModel, ProjectModel } = await import('../models/sequelize');
    
    try {
      await UserModel.findOne({ limit: 1 });
      await ProjectModel.findOne({ limit: 1 });
      
      return {
        connected: true,
        tablesExist: true,
      };
    } catch (error) {
      // Tables might not exist yet
      return {
        connected: true,
        tablesExist: false,
      };
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      connected: false,
      tablesExist: false,
    };
  }
}
