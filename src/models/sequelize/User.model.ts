import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '../../config/database';
import { User } from '../user.model';
import RoleModel from './Role.model';

// Database attributes (without roles, which come from associations)
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

// Attributes that are required for creation
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
}

// Sequelize Model definition
class UserModel extends Model<UserAttributes, UserCreationAttributes> {
  public id!: string;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  // roles is not a database column, it comes from Role associations

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual getter for roles (populated from associations)
  public getRolesArray(): string[] {
    // This will be populated from the Role associations
    const roles = (this as any).Roles;
    if (Array.isArray(roles)) {
      return roles.map((role: any) => role.name);
    }
    return ['user']; // Default role
  }
}

// Initialize model - will be called when database is enabled
export function initializeUserModel(): void {
  const USE_DATABASE = process.env.USE_DATABASE === 'true';
  if (!USE_DATABASE) return;
  
  try {
    const sequelize = getSequelize();
    // Only initialize if not already initialized
    if (!(UserModel as any).sequelize) {
      UserModel.init(
      {
        id: {
          type: DataTypes.STRING(36),
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          // Unique constraint is handled via index below (SQL Server compatibility)
        },
        passwordHash: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: 'password_hash',
        },
        // Roles are now stored in a separate table via many-to-many relationship
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
          {
            name: 'IX_users_email_unique',
            unique: true,
            fields: ['email'],
          },
        ],
      }
      );
    }
  } catch (error) {
    // Silently fail if database is not configured
    console.warn('Failed to initialize UserModel:', error);
  }
}

// Auto-initialize if database is enabled
const USE_DATABASE = process.env.USE_DATABASE === 'true';
if (USE_DATABASE) {
  initializeUserModel();
}

export default UserModel;
