import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '../../config/database';
import { Role } from '../role.model';

// Attributes that are required for creation
interface RoleCreationAttributes extends Optional<Role, 'id'> {
  id?: string;
  name: string;
  description?: string;
}

// Sequelize Model definition
class RoleModel extends Model<Role, RoleCreationAttributes> implements Role {
  public id!: string;
  public name!: string;
  public description?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model - will be called when database is enabled
export function initializeRoleModel(): void {
  const USE_DATABASE = process.env.USE_DATABASE === 'true';
  if (!USE_DATABASE) return;
  
  try {
    const sequelize = getSequelize();
    // Only initialize if not already initialized
    if (!(RoleModel as any).sequelize) {
      RoleModel.init(
        {
          id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
          },
          name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
          },
          description: {
            type: DataTypes.STRING(255),
            allowNull: true,
          },
        },
        {
          sequelize,
          tableName: 'roles',
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          indexes: [
            {
              name: 'IX_roles_name',
              unique: true,
              fields: ['name'],
            },
          ],
        }
      );
    }
  } catch (error) {
    // Silently fail if database is not configured
    console.warn('Failed to initialize RoleModel:', error);
  }
}

// Auto-initialize if database is enabled
const USE_DATABASE = process.env.USE_DATABASE === 'true';
if (USE_DATABASE) {
  initializeRoleModel();
}

export default RoleModel;
