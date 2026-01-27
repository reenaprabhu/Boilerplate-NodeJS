import { Router } from "express";
import { requireRoles } from "../middleware/rbac";
import { requireAuth } from "../middleware/requireAuth";
import { projectController } from "../config/dependencies";

const router = Router();

/**
 * @swagger
 * /project:
 *   get:
 *     summary: Get all projects (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get("/", requireAuth, projectController.getAll);

/**
 * @swagger
 * /project/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", requireAuth, projectController.getById);

/**
 * @swagger
 * /project/owner/{ownerId}:
 *   get:
 *     summary: Get projects by owner ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Owner user ID
 *     responses:
 *       200:
 *         description: List of projects owned by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/owner/:ownerId", requireAuth, projectController.getByOwner);

/**
 * @swagger
 * /project:
 *   post:
 *     summary: Create a new project (Admin/Manager only)
 *     tags: [Projects]
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
 *               - ownerId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Project"
 *               description:
 *                 type: string
 *                 example: "Project description"
 *               ownerId:
 *                 type: string
 *                 example: "user-id-123"
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Manager role required
 */
router.post("/", requireRoles("admin", "manager"), projectController.create);

/**
 * @swagger
 * /project/{id}:
 *   put:
 *     summary: Update a project (Admin/Manager only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Project Name"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Manager role required
 */
router.put("/:id", requireRoles("admin", "manager"), projectController.update);

/**
 * @swagger
 * /project/{id}:
 *   delete:
 *     summary: Delete a project (Admin/Manager only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Manager role required
 */
router.delete("/:id", requireRoles("admin", "manager"), projectController.delete);

export default router;
