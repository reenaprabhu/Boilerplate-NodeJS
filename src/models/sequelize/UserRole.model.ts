import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../../config/database';
import UserModel from './User.model';
import RoleModel from './Role.model';

// Junction table for User-Role many-to-many relationship
interface UserRoleAttributes {
  userId: string;
  roleId: string;
  createdAt?: Date;
}

class UserRoleModel extends Model<UserRoleAttributes> implements UserRoleAttributes {
  public userId!: string;
  public roleId!: string;
  public readonly createdAt!: Date;
}

// Initialize model - will be called when database is enabled
export function initializeUserRoleModel(): void {
  const USE_DATABASE = process.env.USE_DATABASE === 'true';
  if (!USE_DATABASE) return;
  
  try {
    const sequelize = getSequelize();
    // Only initialize if not already initialized
    if (!(UserRoleModel as any).sequelize) {
      UserRoleModel.init(
        {
          userId: {
            type: DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true,
            field: 'user_id',
            references: {
              model: UserModel,
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          roleId: {
            type: DataTypes.STRING(36),
            allowNull: false,
            primaryKey: true,
            field: 'role_id',
            references: {
              model: RoleModel,
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
        },
        {
          sequelize,
          tableName: 'user_roles',
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: false, // No updated_at for junction table
          indexes: [
            {
              name: 'IX_user_roles_user_id',
              fields: ['user_id'],
            },
            {
              name: 'IX_user_roles_role_id',
              fields: ['role_id'],
            },
            {
              name: 'IX_user_roles_unique',
              unique: true,
              fields: ['user_id', 'role_id'],
            },
          ],
        }
      );
    }
  } catch (error) {
    // Silently fail if database is not configured
    console.warn('Failed to initialize UserRoleModel:', error);
  }
}

// Auto-initialize if database is enabled
const USE_DATABASE = process.env.USE_DATABASE === 'true';
if (USE_DATABASE) {
  initializeUserRoleModel();
}

export default UserRoleModel;
