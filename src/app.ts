import express from 'express';
import 'express-async-errors';

import healthRoute from './routes/health.route';
import authRoute from './routes/auth.route';
import userRoute from './routes/user.route';
import projectRoute from './routes/project.route';
import { authMiddleware } from './middleware/auth.middleware';

const repoApp = () => {
  const app = express();

  app.use(express.json());

  // Simple request logger (dev)
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Parse user from JWT (sets req.currentUser)
  app.use(authMiddleware);

  // Public routes
  app.use('/health', healthRoute);
  app.use('/auth', authRoute);

  // Protected routes (RBAC applied inside route handlers)
  app.use('/users', userRoute);
  app.use('/projects', projectRoute);

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(
    (err: any, _req: express.Request, res: express.Response, _next: any) => {
      console.error(err);
      const status = err.status || 500;
      const message = err.message || 'Internal Server Error';
      res.status(status).json({ error: message });
    }
  );

  return app;
};

export default repoApp;
