# Boilerplate-NodeJS

A high-performance Node.js application boilerplate designed for high read and medium write traffic scenarios. Built with TypeScript, Express, Sequelize ORM, SQL Server, and Redis caching.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Docker Deployment](#docker-deployment)
- [Design Patterns](#design-patterns)
- [Performance Optimizations](#performance-optimizations)
- [Scaling Strategies](#scaling-strategies)
- [Troubleshooting](#troubleshooting)

## Features

✅ **Layered Architecture** - Controller → Service → Repository pattern  
✅ **Code-First Database** - Automatic schema creation with Sequelize  
✅ **Role-Based Access Control (RBAC)** - Separate roles table with many-to-many relationships  
✅ **Redis Caching** - Cache-aside pattern for high read performance  
✅ **Connection Pooling** - Optimized database connections  
✅ **Pagination Support** - Efficient data retrieval  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Swagger Documentation** - Interactive API docs  
✅ **TypeScript** - Type-safe development  
✅ **Dependency Injection** - Flexible repository switching  
✅ **Docker Support** - Complete Docker Compose setup with all services  

## Architecture

### System Architecture

```
Request → Controller → Service → Repository
                            ↓
                    ┌───────┴───────┐
                    ↓               ↓
               Redis Cache    SQL Server DB
               (Read-first)   (Sequelize ORM)
                    ↑               ↓
                    └───────┬───────┘
                      Cache Invalidation on Write
```

### Project Structure

```
src/
├── config/
│   ├── cache.ts          # Redis caching service (cache-aside pattern)
│   ├── database.ts       # Sequelize connection and configuration
│   ├── database-init.ts  # Code-first database initialization
│   ├── dependencies.ts   # Dependency injection container
│   └── swagger.ts        # API documentation
├── controllers/          # HTTP request handlers
│   ├── user.controller.ts
│   ├── project.controller.ts
│   └── role.controller.ts
├── services/             # Business logic layer
│   ├── user.service.ts
│   ├── project.service.ts
│   ├── role.service.ts
│   └── auth.service.ts
├── repositories/         # Data access layer
│   ├── *.repository.ts   # In-memory implementation
│   └── *.repository.db.ts # Database implementation with caching
├── models/               # Type definitions and Sequelize models
│   ├── user.model.ts
│   ├── project.model.ts
│   ├── role.model.ts
│   └── sequelize/        # Sequelize model definitions
│       ├── User.model.ts
│       ├── Project.model.ts
│       ├── Role.model.ts
│       └── UserRole.model.ts
├── middleware/           # Express middleware
│   ├── auth.middleware.ts
│   ├── requireAuth.ts
│   └── rbac.ts
├── routes/               # Route definitions
│   ├── auth.route.ts
│   ├── user.route.ts
│   ├── project.route.ts
│   ├── role.route.ts
│   └── user-role.route.ts
├── services/             # Business logic
├── types/                # TypeScript types
│   ├── express.d.ts
│   └── pagination.ts
└── utils/                # Utility functions
    └── jwt.ts
```

## Prerequisites

- **Node.js** 18+ 
- **SQL Server** 2019+ or Azure SQL Database
- **Redis** 6+ (optional, for caching)
- **npm** or **yarn**

## Installation

### Option 1: Docker (Recommended)

The easiest way to run the entire application stack is using Docker Compose.

**Prerequisites:**
- Docker Desktop installed and running
- Verify Docker is running: `docker ps` (should not show errors)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Boilerplate-NodeJS
   ```

2. **Start Docker Desktop** (if not already running)
   - Windows: Search for "Docker Desktop" in Start menu
   - Mac: Open Docker Desktop from Applications
   - Wait for Docker to fully start (check system tray/status bar)

3. **Start all services with Docker Compose**
   ```bash
   # Production mode (builds and runs all services)
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop all services
   docker-compose down
   ```
   
   **Note:** First run will take longer as it builds images and downloads base images.

3. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs
   - SQL Server: localhost:1433
   - Redis: localhost:6379

4. **Development with Docker (only infrastructure)**
   ```bash
   # Start only SQL Server and Redis for local development
   docker-compose -f docker-compose.dev.yml up -d
   
   # Run backend and frontend locally
   npm run dev  # Backend
   cd frontend && npm start  # Frontend
   ```

**Docker Services:**
- `backend`: Node.js API server (port 3001)
- `frontend`: Angular application served via nginx (port 4200)
- `sqlserver`: SQL Server 2022 database (port 1433)
- `redis`: Redis cache server (port 6379)

### Option 2: Local Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Boilerplate-NodeJS
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory (see [Configuration](#configuration) section)

5. **Create database**
   ```sql
   CREATE DATABASE myapp;
   ```

6. **Start Redis** (optional, for caching)
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:7-alpine
   
   # Or install and run locally
   redis-server
   ```

7. **Start the application**
   ```bash
   # Backend - Development mode (with hot reload)
   npm run dev
   
   # Backend - Production mode
   npm run build
   npm start
   
   # Frontend - Development mode
   cd frontend
   npm start
   
   # Frontend - Production build
   cd frontend
   npm run build
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
# Set USE_DATABASE=true to enable database mode
USE_DATABASE=true

# Database Provider: 'local' or 'azure'
DB_PROVIDER=local

# Local SQL Server Configuration
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=1433
LOCAL_DB_NAME=myapp
LOCAL_DB_USER=sa
LOCAL_DB_PASSWORD=your-password
LOCAL_DB_ENCRYPT=true
LOCAL_DB_TRUST_CERT=true

# Azure SQL Database Configuration
AZURE_DB_HOST=your-server.database.windows.net
AZURE_DB_PORT=1433
AZURE_DB_NAME=your-database
AZURE_DB_USER=your-user@your-server
AZURE_DB_PASSWORD=your-password
AZURE_DB_ENCRYPT=true
AZURE_DB_TRUST_CERT=false

# Connection Pool Configuration (optional)
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_IDLE_TIMEOUT=30000
DB_LOGGING=false

# Database Initialization
# Set DISABLE_DB_INIT=true to skip automatic schema creation
DISABLE_DB_INIT=false

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
USE_REDIS=true

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

### Database Provider Selection

The application supports two database providers:

1. **Local SQL Server** (`DB_PROVIDER=local`)
   - Uses `LOCAL_DB_*` environment variables
   - Suitable for development and on-premises deployments

2. **Azure SQL Database** (`DB_PROVIDER=azure`)
   - Uses `AZURE_DB_*` environment variables
   - Suitable for cloud deployments

### In-Memory Mode (Development)

To use in-memory repositories (no database required):

```bash
# In .env file
USE_DATABASE=false
```

## Database Setup

### Code-First Approach

The application uses **Sequelize ORM** with a **code-first approach**. Tables and indexes are automatically created when the application starts.

#### Automatic Schema Creation

When `USE_DATABASE=true` and `DISABLE_DB_INIT=false`:

1. Application connects to SQL Server
2. Checks if tables exist
3. Creates missing tables with proper structure
4. Creates missing indexes for performance
5. Sets up associations (foreign keys, many-to-many relationships)
6. Creates default roles (user, admin, manager)

#### Database Schema

**Users Table**
- `id` (NVARCHAR(36), Primary Key)
- `name` (NVARCHAR(255))
- `email` (NVARCHAR(255), Unique Index)
- `password_hash` (NVARCHAR(255))
- `created_at` (DATETIME2)
- `updated_at` (DATETIME2)

**Roles Table**
- `id` (NVARCHAR(36), Primary Key)
- `name` (NVARCHAR(100), Unique)
- `description` (NVARCHAR(255))
- `created_at` (DATETIME2)
- `updated_at` (DATETIME2)

**UserRoles Table** (Junction Table)
- `user_id` (NVARCHAR(36), Foreign Key → users.id)
- `role_id` (NVARCHAR(36), Foreign Key → roles.id)
- `created_at` (DATETIME2)
- Composite Primary Key (user_id, role_id)

**Projects Table**
- `id` (NVARCHAR(36), Primary Key)
- `name` (NVARCHAR(255))
- `description` (NVARCHAR(MAX))
- `owner_id` (NVARCHAR(36), Foreign Key → users.id)
- `created_at` (DATETIME2)
- `updated_at` (DATETIME2)

#### Indexes

- `IX_users_email_unique` - Unique index on users.email
- `IX_roles_name` - Unique index on roles.name
- `IX_user_roles_user_id` - Index on user_roles.user_id
- `IX_user_roles_role_id` - Index on user_roles.role_id
- `IX_user_roles_unique` - Unique composite index on (user_id, role_id)
- `IX_projects_owner_id` - Index on projects.owner_id

#### Disable Auto-Initialization

To manage schema manually:

```bash
DISABLE_DB_INIT=true
```

Then run migration scripts manually if needed.

#### Migration Scripts

If you need to remove the old `roles` column from the `users` table (from previous schema):

```bash
# Run the migration script
sqlcmd -S localhost -U sa -P your-password -d myapp -i scripts/remove-roles-column.sql
```

## API Documentation

### Swagger UI

Interactive API documentation is available at:
```
http://localhost:3001/api-docs
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "roles": ["user", "manager"]  // Optional: array of role names
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["user", "manager"]
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "token": "token_...",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "roles": ["user", "manager"]
  }
}
```

**Error Handling:**
- Returns `401 Unauthorized` with error message for invalid email or password
- Error message: "Invalid credentials" for authentication failures

#### Delete User
```http
DELETE /auth/delete
Authorization: Bearer <token>
```

### User Endpoints

#### Get All Users (Paginated) - Admin Only
```http
GET /user?page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Get User by ID
```http
GET /user/:id
Authorization: Bearer <token>
```

#### Create User - Admin or Manager Only
```http
POST /user
Authorization: Bearer <admin_or_manager_token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "roles": ["user"]  // Optional: array of role names
}
```

#### Update User - Admin Only
```http
PUT /user/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "roles": ["admin"]
}
```

#### Delete User - Admin Only
```http
DELETE /user/:id
Authorization: Bearer <admin_token>
```

### Role Management Endpoints

#### Get All Roles
```http
GET /role
Authorization: Bearer <token>
```

#### Get Role by ID
```http
GET /role/:id
Authorization: Bearer <token>
```

#### Create Role (Admin Only)
```http
POST /role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "editor",
  "description": "Editor role with content management permissions"
}
```

#### Update Role (Admin Only)
```http
PUT /role/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "updated-role-name",
  "description": "Updated description"
}
```

#### Delete Role (Admin Only)
```http
DELETE /role/:id
Authorization: Bearer <admin_token>
```

### User Role Assignment Endpoints

#### Assign Roles to User (Admin Only)
```http
POST /user/:userId/roles
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "roleNames": ["admin", "manager"]
}
```

#### Get User Roles
```http
GET /user/:userId/roles
Authorization: Bearer <token>
```

### Project Endpoints

#### Get All Projects (Paginated) - Any Authenticated User
```http
GET /project?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Project by ID - Any Authenticated User
```http
GET /project/:id
Authorization: Bearer <token>
```

#### Get Projects by Owner - Any Authenticated User
```http
GET /project/owner/:ownerId
Authorization: Bearer <token>
```

#### Create Project - Admin or Manager Only
```http
POST /project
Authorization: Bearer <admin_or_manager_token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description"
}
```

**Note:** The `ownerId` is automatically set from the authenticated user's ID.

#### Update Project - Admin or Manager Only
```http
PUT /project/:id
Authorization: Bearer <admin_or_manager_token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

#### Delete Project - Admin or Manager Only
```http
DELETE /project/:id
Authorization: Bearer <admin_or_manager_token>
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "connected": true,
    "tablesExist": true
  }
}
```

## Role-Based Access Control (RBAC)

The application implements a comprehensive RBAC system with three default roles: **admin**, **manager**, and **user**.

### Default Roles

- **admin**: Full access to all resources (users, roles, projects)
- **manager**: Can create users and projects, but cannot manage roles
- **user**: Read-only access to projects

### Permission Matrix

| Endpoint | Admin | Manager | User |
|----------|-------|---------|------|
| **Authentication** |
| `POST /auth/register` | ✅ | ✅ | ✅ |
| `POST /auth/login` | ✅ | ✅ | ✅ |
| `DELETE /auth/delete` | ✅ | ✅ | ✅ |
| **Users** |
| `GET /user` (List) | ✅ | ❌ | ❌ |
| `GET /user/:id` | ✅ | ✅ | ✅ (own profile) |
| `POST /user` (Create) | ✅ | ✅ | ❌ |
| `PUT /user/:id` (Update) | ✅ | ❌ | ❌ |
| `DELETE /user/:id` | ✅ | ❌ | ❌ |
| **Roles** |
| `GET /role` (List) | ✅ | ❌ | ❌ |
| `GET /role/:id` | ✅ | ❌ | ❌ |
| `POST /role` (Create) | ✅ | ❌ | ❌ |
| `PUT /role/:id` (Update) | ✅ | ❌ | ❌ |
| `DELETE /role/:id` | ✅ | ❌ | ❌ |
| **Projects** |
| `GET /project` (List) | ✅ | ✅ | ✅ |
| `GET /project/:id` | ✅ | ✅ | ✅ |
| `GET /project/owner/:ownerId` | ✅ | ✅ | ✅ |
| `POST /project` (Create) | ✅ | ✅ | ❌ |
| `PUT /project/:id` (Update) | ✅ | ✅ | ❌ |
| `DELETE /project/:id` | ✅ | ✅ | ❌ |
| **User Roles** |
| `POST /user/:userId/roles` | ✅ | ❌ | ❌ |
| `GET /user/:userId/roles` | ✅ | ✅ | ✅ |

### RBAC Implementation

- **Middleware**: `requireAuth` - Validates JWT token and attaches user to request
- **Middleware**: `requireRoles(...roles)` - Checks if user has any of the specified roles
- **JWT Token**: Includes user ID, email, and roles array
- **Error Handling**: Returns `403 Forbidden` for unauthorized access attempts

### Creating Users with Roles

When registering or creating a user, you can assign roles:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "roles": ["user", "manager"]  // Optional: if omitted, defaults to ["user"]
}
```

## Design Patterns

### 1. Layered Architecture

**Controller Layer** → Handles HTTP requests/responses, validation  
**Service Layer** → Business logic, orchestration  
**Repository Layer** → Data access abstraction (supports both in-memory and database)

### 2. Cache-Aside Pattern (Lazy Loading)

**Read Flow:**
1. Check Redis cache first
2. If cache miss, fetch from database
3. Cache the result for future requests
4. Return data to client

**Write Flow:**
1. Write to database
2. Invalidate related cache entries
3. Return success response

**Implementation:**
- Cache TTL: 1 hour (configurable)
- Graceful degradation: If Redis fails, app continues (fetches from DB)
- Pattern-based cache invalidation

### 3. Repository Pattern with Abstraction

- Abstract data access layer
- Easy to swap implementations (in-memory ↔ database)
- Supports testing with mock repositories

### 4. Dependency Injection

- Centralized dependency management in `src/config/dependencies.ts`
- Environment-based repository selection
- Single source of truth for service/controller instances

### 5. Code-First Database Schema

- Schema defined in Sequelize models
- Automatic table/index creation on startup
- Version controlled in code
- Idempotent (safe to run multiple times)

## Performance Optimizations

### Read Optimizations (High Read Traffic)

1. **Redis Caching Layer**
   - All read queries cached with configurable TTL
   - Cache keys structured by resource type
   - Graceful degradation if Redis fails

2. **Database Indexes**
   - Frequently queried fields are indexed
   - Composite indexes where applicable
   - Optimized for common query patterns

3. **Query Optimization**
   - Sequelize ORM with optimized queries
   - Selective field loading
   - Efficient filtering and sorting
   - Pagination to limit result sets

4. **Connection Pooling**
   - Sequelize handles connection pooling automatically
   - Reuses database connections
   - Reduces connection overhead

### Write Optimizations (Medium Write Traffic)

1. **Cache Invalidation Strategy**
   - Write operations invalidate related cache entries
   - Pattern-based invalidation for list queries
   - Immediate consistency after writes

2. **Transaction Support**
   - Sequelize provides transaction support
   - Can be extended for batch operations

3. **Optimistic Locking** (Ready for implementation)
   - Can add version fields for conflict resolution

## Scaling Strategies

### Horizontal Scaling

✅ **Stateless Application** - Can run multiple instances  
✅ **Shared Redis Cache** - Consistent across instances  
✅ **Database Connection Pooling** - Handles concurrent requests  
✅ **Pagination** - Prevents memory issues  

### Vertical Scaling

✅ **Connection Pooling** - Tune `DB_POOL_MAX`  
✅ **Cache TTL Tuning** - Adjust based on data freshness needs  
✅ **Database Indexes** - Optimize query performance  

### Future Scaling Options

- **Read Replicas** - Configure separate connection pools for read replicas
- **CDN/Edge Caching** - Add reverse proxy (nginx/Varnish) with caching headers
- **Database Partitioning** - Partition large tables by date/region
- **Message Queues** - Implement queue system (Bull/BullMQ) for async writes

## Docker Deployment

### Building Docker Images

```bash
# Build backend image
docker build -t boilerplate-backend .

# Build frontend image
docker build -t boilerplate-frontend ./frontend
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]  # e.g., backend, frontend, sqlserver, redis

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild and restart services
docker-compose up -d --build

# Scale services (if needed)
docker-compose up -d --scale backend=3
```

### Environment Variables for Docker

The `docker-compose.yml` file includes default environment variables. To customize:

1. **Create a `.env` file** in the root directory:
   ```bash
   # Copy example
   cp .env.example .env
   
   # Edit with your values
   nano .env
   ```

2. **Update docker-compose.yml** to use environment variables:
   ```yaml
   backend:
     environment:
       - JWT_SECRET=${JWT_SECRET}
       - LOCAL_DB_PASSWORD=${DB_PASSWORD}
       # ... etc
   ```

### Production Deployment

For production deployment:

1. **Update environment variables** in `docker-compose.yml`:
   - Change `JWT_SECRET` to a strong random value
   - Update `LOCAL_DB_PASSWORD` to a secure password
   - Set `NODE_ENV=production`
   - Configure `FRONTEND_URL` to your production domain

2. **Use external database** (recommended for production):
   ```yaml
   backend:
     environment:
       - DB_PROVIDER=azure  # or use external SQL Server
       - AZURE_DB_HOST=your-server.database.windows.net
       # ... Azure SQL config
   ```

3. **Remove SQL Server service** from docker-compose.yml if using external database

4. **Use secrets management**:
   ```yaml
   backend:
     secrets:
       - jwt_secret
       - db_password
   secrets:
     jwt_secret:
       file: ./secrets/jwt_secret.txt
     db_password:
       file: ./secrets/db_password.txt
   ```

### Docker Health Checks

All services include health checks:
- **Backend**: Checks `/health` endpoint
- **Frontend**: Checks nginx response
- **SQL Server**: Checks database connectivity
- **Redis**: Checks `PING` command

View health status:
```bash
docker-compose ps
```

## Troubleshooting

### Redis Connection Issues

**Symptoms:** Cache warnings in logs, but app continues to work

**Solutions:**
- Ensure Redis is running: `redis-cli ping`
- Check `REDIS_URL` environment variable
- App will continue without Redis (fetches from DB directly)
- Set `USE_REDIS=false` to disable Redis completely

### Database Connection Issues

**Error: "Database environment variables are missing"**

**Solutions:**
- Verify `USE_DATABASE=true` is set
- Check `DB_PROVIDER` is set to `local` or `azure`
- Ensure all required environment variables for the selected provider are set
- Check `.env` file exists and is properly formatted

**Error: "Login failed for user"**

**Solutions:**
- Verify username and password
- For Azure: Ensure username includes `@server-name` (e.g., `user@server`)
- Check SQL Server authentication mode

**Error: "Certificate chain was issued by an authority that is not trusted"**

**Solutions:**
- For local: Use `LOCAL_DB_TRUST_CERT=true`
- For Azure: Use `AZURE_DB_TRUST_CERT=false` and ensure `AZURE_DB_ENCRYPT=true`

**Error: "Connection timeout"**

**Solutions:**
- Verify server name and port (default: 1433)
- Check firewall rules (Azure Portal → SQL Server → Firewall settings)
- Verify SQL Server is running

### Database Schema Issues

**Error: "Table doesn't exist"**

**Solutions:**
- Ensure `DISABLE_DB_INIT=false` (or not set)
- Check database connection is successful
- Verify user has CREATE TABLE permissions
- Check application startup logs for initialization errors

**Error: "Column doesn't exist"**

**Solutions:**
- Run migration script if needed: `scripts/remove-roles-column.sql`
- Verify Sequelize models match database schema
- Check if `alter: false` in sync options (prevents automatic schema changes)

### Performance Issues

**Slow Queries**

**Solutions:**
- Check if indexes are created (see startup logs)
- Verify Redis is working (check cache hit ratio)
- Monitor database query performance
- Consider increasing connection pool size

**High Memory Usage**

**Solutions:**
- Ensure pagination is used for list endpoints
- Check Redis memory usage
- Monitor connection pool usage
- Review cache TTL settings

## Testing

### Health Check

```bash
curl http://localhost:3001/health
```

### Register User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "roles": ["user"]
  }'
```

### Test Pagination

```bash
curl "http://localhost:3001/user?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

## Security Considerations

- ✅ **Prepared Statements** - Sequelize handles SQL injection prevention
- ✅ **Parameterized Queries** - All queries use parameterized statements
- ✅ **Environment Variables** - Secrets stored in environment variables
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **RBAC** - Role-based access control for endpoints
- ✅ **Password Hashing** - bcryptjs for password hashing
- ✅ **Connection Encryption** - SSL/TLS for database connections

## Monitoring & Observability

Recommended metrics to monitor:

- **Cache hit/miss ratio** (target: >80% for read-heavy workloads)
- **Database query latency** (p50, p95, p99)
- **Connection pool usage** (should not hit limits)
- **Redis memory usage**
- **API response times**
- **Error rates**


