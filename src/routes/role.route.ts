import { Router } from 'express';
import { roleController } from '../config/dependencies';
import { requireAuth } from '../middleware/requireAuth';
import { requireRoles } from '../middleware/rbac';

const router = Router();

/**
 * @swagger
 * /role:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireAuth, roleController.getAll);

/**
 * @swagger
 * /role/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role details
 *       404:
 *         description: Role not found
 */
router.get('/:id', requireAuth, roleController.getById);

/**
 * @swagger
 * /role:
 *   post:
 *     summary: Create a new role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "manager"
 *               description:
 *                 type: string
 *                 example: "Manager role with elevated permissions"
 *     responses:
 *       201:
 *         description: Role created successfully
 *       409:
 *         description: Role already exists
 *       400:
 *         description: Validation error
 */
router.post('/', requireAuth, requireRoles('admin'), roleController.create);

/**
 * @swagger
 * /role/{id}:
 *   put:
 *     summary: Update role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 */
router.put('/:id', requireAuth, requireRoles('admin'), roleController.update);

/**
 * @swagger
 * /role/{id}:
 *   delete:
 *     summary: Delete role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 */
router.delete('/:id', requireAuth, requireRoles('admin'), roleController.delete);

export default router;
