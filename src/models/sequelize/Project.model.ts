import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '../../config/database';
import { Project } from '../project.model';
import UserModel from './User.model';

// Attributes that are required for creation
interface ProjectCreationAttributes extends Optional<Project, 'id'> {
  id?: string;
  name: string;
  description?: string;
  ownerId: string;
}

// Sequelize Model definition
class ProjectModel extends Model<Project, ProjectCreationAttributes> implements Project {
  public id!: string;
  public name!: string;
  public description?: string;
  public ownerId!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model - will be called when database is enabled
export function initializeProjectModel(): void {
  const USE_DATABASE = process.env.USE_DATABASE === 'true';
  if (!USE_DATABASE) return;
  
  try {
    const sequelize = getSequelize();
    // Only initialize if not already initialized
    if (!(ProjectModel as any).sequelize) {
      ProjectModel.init(
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
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        ownerId: {
          type: DataTypes.STRING(36),
          allowNull: false,
          field: 'owner_id',
          references: {
            model: UserModel,
            key: 'id',
          },
        },
      },
      {
        sequelize,
        tableName: 'projects',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
          {
            name: 'IX_projects_owner_id',
            fields: ['owner_id'],
          },
          {
            name: 'IX_projects_created_at',
            fields: ['created_at'],
          },
        ],
      }
      );
    }
  } catch (error) {
    // Silently fail if database is not configured
    console.warn('Failed to initialize ProjectModel:', error);
  }
}

// Auto-initialize if database is enabled
const USE_DATABASE = process.env.USE_DATABASE === 'true';
if (USE_DATABASE) {
  initializeProjectModel();
}

export default ProjectModel;
