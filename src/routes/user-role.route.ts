import { Router, Request, Response } from 'express';
import { userService, roleService } from '../config/dependencies';
import { requireAuth } from '../middleware/requireAuth';
import { requireRoles } from '../middleware/rbac';

const router = Router();

/**
 * @swagger
 * /user/{userId}/roles:
 *   post:
 *     summary: Assign roles to a user (Admin only)
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleNames
 *             properties:
 *               roleNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["admin", "manager"]
 *     responses:
 *       200:
 *         description: Roles assigned successfully
 *       404:
 *         description: User not found
 */
router.post('/:userId/roles', requireAuth, requireRoles('admin'), async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { roleNames } = req.body;

  if (!roleNames || !Array.isArray(roleNames)) {
    return res.status(400).json({
      success: false,
      error: 'roleNames array is required'
    });
  }

  try {
    // Verify user exists
    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify all roles exist
    const roles = await Promise.all(
      roleNames.map(name => roleService.getByName(name))
    );

    const missingRoles = roleNames.filter((name, index) => !roles[index]);
    if (missingRoles.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Roles not found: ${missingRoles.join(', ')}`
      });
    }

    // Update user with new roles
    const updatedUser = await userService.update(userId, { roles: roleNames });
    
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to assign roles'
      });
    }

    res.json({
      success: true,
      message: 'Roles assigned successfully',
      data: {
        userId: updatedUser.id,
        roles: updatedUser.roles
      }
    });
  } catch (error: any) {
    console.error('Assign roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign roles',
      message: error?.message || 'An unexpected error occurred'
    });
  }
});

/**
 * @swagger
 * /user/{userId}/roles:
 *   get:
 *     summary: Get user roles
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User roles
 *       404:
 *         description: User not found
 */
router.get('/:userId/roles', requireAuth, async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        userId: user.id,
        roles: user.roles
      }
    });
  } catch (error: any) {
    console.error('Get user roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user roles'
    });
  }
});

export default router;
