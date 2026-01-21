-- SQL Server Database Initialization Script
-- Run this script to create tables and indexes for the application

-- Create users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id NVARCHAR(36) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        roles NVARCHAR(MAX) NOT NULL DEFAULT '["user"]',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    
    -- Create indexes for read optimization
    CREATE INDEX IX_users_email ON users(email);
    CREATE INDEX IX_users_roles ON users(roles);
    
    PRINT 'Table users created successfully';
END
ELSE
BEGIN
    PRINT 'Table users already exists';
END
GO

-- Create projects table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='projects' AND xtype='U')
BEGIN
    CREATE TABLE projects (
        id NVARCHAR(36) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        owner_id NVARCHAR(36) NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    -- Create indexes for read optimization
    CREATE INDEX IX_projects_owner_id ON projects(owner_id);
    CREATE INDEX IX_projects_created_at ON projects(created_at);
    
    PRINT 'Table projects created successfully';
END
ELSE
BEGIN
    PRINT 'Table projects already exists';
END
GO

PRINT 'Database initialization completed';
