import { getSequelize } from '../../config/database';
import UserModel from './User.model';
import ProjectModel from './Project.model';
import RoleModel from './Role.model';
import UserRoleModel from './UserRole.model';

// Ensure models are loaded (this initializes them)
// Models are initialized when imported, but we need to ensure they're all imported
// before associations are set up

// Export models
export { UserModel, ProjectModel, RoleModel, UserRoleModel };

/**
 * Initialize model associations
 * This should be called after all models are initialized
 */
export function initializeAssociations(): void {
  try {
    // Ensure all models are initialized before setting up associations
    const userModelInitialized = (UserModel as any).sequelize !== undefined;
    const projectModelInitialized = (ProjectModel as any).sequelize !== undefined;
    const roleModelInitialized = (RoleModel as any).sequelize !== undefined;
    const userRoleModelInitialized = (UserRoleModel as any).sequelize !== undefined;
    
    if (!userModelInitialized || !projectModelInitialized || !roleModelInitialized || !userRoleModelInitialized) {
      console.warn('Models not fully initialized, skipping association setup');
      return;
    }
    
    // Set up associations between User and Project models
    // Check if associations are already set up to avoid duplicate setup
    if (!(ProjectModel as any).associations?.owner) {
      ProjectModel.belongsTo(UserModel, {
        foreignKey: 'ownerId',
        as: 'owner',
      });
    }
    
    if (!(UserModel as any).associations?.projects) {
      UserModel.hasMany(ProjectModel, {
        foreignKey: 'ownerId',
        as: 'projects',
      });
    }

    // Set up many-to-many relationship between User and Role
    if (!(UserModel as any).associations?.Roles) {
      UserModel.belongsToMany(RoleModel, {
        through: UserRoleModel,
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'Roles',
      });
    }

    if (!(RoleModel as any).associations?.Users) {
      RoleModel.belongsToMany(UserModel, {
        through: UserRoleModel,
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'Users',
      });
    }
  } catch (error) {
    // Silently fail if associations can't be set up
    console.warn('Failed to initialize model associations:', error);
  }
}

/**
 * Sync all models with database (code-first approach)
 * This will create tables if they don't exist
 */
export async function syncModels(force: boolean = false): Promise<void> {
  try {
    const sequelize = getSequelize();
    
    // Initialize associations before syncing
    initializeAssociations();
    
    // Use alter: false to avoid SQL Server syntax issues with UNIQUE constraints
    // alter: true causes issues because SQL Server doesn't support UNIQUE in ALTER COLUMN
    // Tables will be created if they don't exist, but won't be modified if they do
    await sequelize.sync({ force, alter: false });
    console.log('Database models synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database models:', error);
    throw error;
  }
}

/**
 * Test database connection and verify models
 */
export async function testModels(): Promise<boolean> {
  try {
    console.log("Inside testModels");
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('Database connection verified');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
