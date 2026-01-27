# Frontend Dockerfile - Multi-stage build
FROM node:18-alpine AS builder

# Build argument for API URL
ARG API_URL=http://localhost:3001

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Update environment.prod.ts with API URL at build time using Node.js
RUN node -e "const fs = require('fs'); const content = fs.readFileSync('src/environments/environment.prod.ts', 'utf8'); const updated = content.replace(/apiUrl: '[^']*'/, \"apiUrl: '${API_URL}'\"); fs.writeFileSync('src/environments/environment.prod.ts', updated);"

# Build Angular application for production
RUN npm run build -- --configuration production

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder
# Angular 17+ application builder outputs to dist/{project-name}/browser
# The project name is "frontend" based on angular.json
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
