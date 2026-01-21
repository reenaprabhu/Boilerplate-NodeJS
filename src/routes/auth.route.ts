import { Router, Request, Response } from "express";
import { authService, userService } from "../config/dependencies";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email and password required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const { token } = await authService.login(email, password);
    res.json({ token });
  } catch {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user", "manager"]
 *                 description: "Optional array of role names to assign to the user"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/register", async (req: Request, res: Response) => {
  console.log("➡️ /register called");

  const { name, email, password, roles } = req.body;
  console.log("📦 Request body:", req.body);

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false,
      error: "Name, email, and password are required" 
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      error: "Invalid email format" 
    });
  }

  // Password validation (minimum 6 characters)
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      error: "Password must be at least 6 characters long" 
    });
  }

  // Validate roles if provided
  if (roles !== undefined) {
    if (!Array.isArray(roles)) {
      return res.status(400).json({ 
        success: false,
        error: "Roles must be an array" 
      });
    }
    
    if (roles.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Roles array cannot be empty. Provide at least one role or omit the field to use default 'user' role" 
      });
    }

    // Validate that all role names are strings
    if (!roles.every(role => typeof role === 'string' && role.trim().length > 0)) {
      return res.status(400).json({ 
        success: false,
        error: "All roles must be non-empty strings" 
      });
    }
  }

  try {
    console.log("🔍 Checking existing user...");
    const existingUser = await userService.getByEmail(email);
    console.log("✅ getByEmail finished");

    if (existingUser) {
      console.log("⚠️ User already exists");
      return res.status(409).json({
        success: false,
        error: "User with this email already exists"
      });
    }

    // If roles provided, validate they exist in the database
    if (roles && roles.length > 0) {
      const { roleService } = await import('../config/dependencies');
      const existingRoles = await Promise.all(
        roles.map((roleName: string) => roleService.getByName(roleName))
      );
      
      const missingRoles = roles.filter((roleName: string, index: number) => !existingRoles[index]);
      if (missingRoles.length > 0) {
        return res.status(400).json({
          success: false,
          error: `The following roles do not exist: ${missingRoles.join(', ')}`
        });
      }
    }

    console.log("🆕 Creating user...");
    const user = await userService.create({ name, email, password, roles });
    console.log("✅ User created");

    const { passwordHash, ...userResponse } = user;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse
    });

  } catch (error: any) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to register user",
      message: error?.message || "Unexpected error"
    });
  }
});


/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/delete", requireAuth, async (req: Request, res: Response) => {
  const userId = req.currentUser?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized - Please login first" });
  }

  try {
    const deleted = await userService.delete(userId);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      success: true, 
      message: "User account deleted successfully" 
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user account" });
  }
});

export default router;
