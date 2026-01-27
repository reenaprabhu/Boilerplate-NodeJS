# Docker Deployment Guide

This guide explains how to deploy the Boilerplate-NodeJS application using Docker.

## Quick Start

### Start All Services

```bash
docker-compose up -d
```

This will start:
- **Backend API** on http://localhost:3001
- **Frontend** on http://localhost:4200
- **SQL Server** on localhost:1433
- **Redis** on localhost:6379

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f sqlserver
docker-compose logs -f redis
```

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove Data

```bash
# ⚠️ This will delete all database and Redis data
docker-compose down -v
```

## Development Mode

For local development, you can run only the infrastructure services (SQL Server and Redis) in Docker:

```bash
# Start only SQL Server and Redis
docker-compose -f docker-compose.dev.yml up -d

# Run backend locally
npm run dev

# Run frontend locally (in another terminal)
cd frontend
npm start
```

## Building Images Manually

### Backend

```bash
docker build -t boilerplate-backend .
```

### Frontend

```bash
docker build -t boilerplate-frontend ./frontend
```

## Configuration

### Environment Variables

The `docker-compose.yml` file includes default environment variables. To customize:

1. **Create `.env` file** (optional):
   ```bash
   cp .env.example .env
   ```

2. **Update docker-compose.yml** environment section:
   ```yaml
   backend:
     environment:
       - JWT_SECRET=your-secret-key
       - LOCAL_DB_PASSWORD=YourStrong@Passw0rd
   ```

### Important Environment Variables

- `JWT_SECRET`: Change this to a strong random value in production
- `LOCAL_DB_PASSWORD`: SQL Server SA password (must meet complexity requirements)
- `FRONTEND_URL`: URL where frontend is accessible (for CORS)
- `USE_REDIS`: Set to `false` to disable Redis caching
- `USE_DATABASE`: Set to `false` to use in-memory repositories

## Production Deployment

### Security Checklist

1. **Change default passwords:**
   - Update `MSSQL_SA_PASSWORD` in docker-compose.yml
   - Update `LOCAL_DB_PASSWORD` in backend environment
   - Change `JWT_SECRET` to a strong random value

2. **Use external database** (recommended):
   - Remove `sqlserver` service from docker-compose.yml
   - Configure `AZURE_DB_*` or external SQL Server connection
   - Update `DB_PROVIDER` environment variable

3. **Configure CORS:**
   - Set `FRONTEND_URL` to your production domain
   - Update frontend `environment.prod.ts` with production API URL

4. **Use secrets management:**
   - Use Docker secrets or environment variable files
   - Never commit secrets to version control

### Using External Database

Edit `docker-compose.yml`:

```yaml
backend:
  environment:
    - DB_PROVIDER=azure  # or 'local' for external SQL Server
    - AZURE_DB_HOST=your-server.database.windows.net
    - AZURE_DB_NAME=your-database
    - AZURE_DB_USER=your-user@your-server
    - AZURE_DB_PASSWORD=your-password
    # Remove LOCAL_DB_* variables
```

Remove the `sqlserver` service from docker-compose.yml.

## Troubleshooting

### Docker Daemon Not Running

**Error:** `error during connect: this error may indicate that the docker daemon is not running`

**Solution:**
1. **Start Docker Desktop:**
   - Windows: Search for "Docker Desktop" in Start menu and launch it
   - Mac: Open Docker Desktop from Applications
   - Wait for Docker to fully start (check system tray/status bar)

2. **Verify Docker is running:**
   ```bash
   docker ps
   ```
   Should return a list of containers (or empty list if no containers running)

3. **Check Docker Desktop status:**
   - Look for Docker icon in system tray (Windows) or menu bar (Mac)
   - Icon should be steady (not animating)
   - Click icon to see "Docker Desktop is running" status

### Container Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Check if ports are in use
netstat -an | grep 3001
netstat -an | grep 1433
netstat -an | grep 6379
netstat -an | grep 4200
```

### SQL Server Connection Issues

- Wait 30-60 seconds for SQL Server to fully start
- Check health: `docker-compose ps`
- Verify password matches in all places
- Check logs: `docker-compose logs sqlserver`

### Frontend Can't Connect to Backend

- Verify `FRONTEND_URL` in backend matches frontend URL
- Check CORS configuration in `src/app.ts`
- Test backend: `curl http://localhost:3001/health`
- Check backend logs: `docker-compose logs backend`

### Database Initialization Fails

- Check SQL Server is healthy: `docker-compose ps sqlserver`
- Verify database connection details
- Check logs: `docker-compose logs backend`
- Set `DISABLE_DB_INIT=true` to skip auto-initialization

### Redis Connection Errors

- Redis is optional - set `USE_REDIS=false` to disable
- Check Redis is running: `docker-compose ps redis`
- Verify `REDIS_URL=redis://redis:6379` in backend environment

## Health Checks

All services include health checks. View status:

```bash
docker-compose ps
```

Services should show `(healthy)` status when ready.

## Volumes

Docker Compose creates persistent volumes:
- `sqlserver-data`: SQL Server database files
- `redis-data`: Redis persistence data

To backup data:
```bash
# Backup SQL Server volume
docker run --rm -v boilerplate-nodejs_sqlserver-data:/data -v $(pwd):/backup alpine tar czf /backup/sqlserver-backup.tar.gz /data

# Backup Redis volume
docker run --rm -v boilerplate-nodejs_redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz /data
```

## Scaling

To scale the backend service:

```bash
docker-compose up -d --scale backend=3
```

Note: You'll need a load balancer (nginx, traefik) in front of multiple backend instances.

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Remove everything including volumes
docker-compose down -v --rmi all
```
