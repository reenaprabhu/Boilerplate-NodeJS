-- Migration script to remove roles column from users table
-- This script should be run if the roles column exists from a previous schema
-- Roles are now stored in the user_roles junction table

-- Check if roles column exists and remove it
IF EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'roles'
)
BEGIN
    -- Drop index on roles column if it exists
    IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_users_roles' AND object_id = OBJECT_ID('users'))
    BEGIN
        DROP INDEX IX_users_roles ON users;
        PRINT 'Dropped index IX_users_roles';
    END

    -- Remove roles column
    ALTER TABLE users DROP COLUMN roles;
    PRINT 'Removed roles column from users table';
END
ELSE
BEGIN
    PRINT 'Roles column does not exist in users table - no action needed';
END
GO

PRINT 'Migration completed successfully';
