/*import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repositories/user.repository";
import { requireRoles } from "../middleware/rbac";

const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);

const router = Router();

router.get("/", requireRoles(["admin", "manager"]), controller.getAll);
router.get("/:id", controller.getById);
router.post("/", requireRoles(["admin", "manager"]), controller.create);
router.put("/:id", requireRoles(["admin", "manager"]), controller.update);
router.delete("/:id", requireRoles(["admin", "manager"]), controller.delete);

export default router;*/

import { Router } from 'express';
import { requireRoles } from '../middleware/rbac';

const router = Router();

/**
 * @swagger
 * /user/admin:
 *   get:
 *     summary: Admin-only endpoint
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success message for admin users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello user@example.com, you are an admin!"
 *       401:
 *         description: Unauthorized - No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User does not have admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/admin', requireRoles('admin'), (req, res) => {
  res.json({ message: `Hello ${req.currentUser?.email}, you are an admin!` });
});

export default router;

