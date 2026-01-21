import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../config/database-init';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 database:
 *                   type: object
 *                   properties:
 *                     connected:
 *                       type: boolean
 *                     tablesExist:
 *                       type: boolean
 */
router.get('/', async (_req: Request, res: Response) => {
  const USE_DATABASE = process.env.USE_DATABASE === 'true' || !!process.env.DATABASE_URL;
  
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  if (USE_DATABASE) {
    try {
      const dbHealth = await checkDatabaseHealth();
      health.database = dbHealth;
    } catch (error) {
      health.database = {
        connected: false,
        tablesExist: false,
        error: 'Health check failed',
      };
    }
  }

  res.json(health);
});

export default router;