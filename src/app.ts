/// <reference path="./types/express.d.ts" />
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import userRoutes from './routes/user.route';
import authRoutes from './routes/auth.route';
import projectRoutes from './routes/project.route';
import roleRoutes from './routes/role.route';
import userRoleRoutes from './routes/user-role.route';
import healthRoutes from './routes/health.route';
import { verifyToken } from './utils/jwt';

const app = express();

// CORS configuration - Allow requests from Angular frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global middleware to set currentUser
app.use((req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];
  if (typeof token === 'string') {
    const payload = verifyToken(token.replace('Bearer ', ''));
    if (payload) {
      req.currentUser = payload;
    }
  }
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/user', userRoleRoutes); // User role management routes
app.use('/project', projectRoutes);
app.use('/role', roleRoutes);
app.use('/health', healthRoutes);

export default () => app;
