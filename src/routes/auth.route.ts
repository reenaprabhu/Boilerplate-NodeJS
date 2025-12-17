import { Router } from "express";
import { AuthService } from "../services/auth.service";
import { UserRepository } from "../repositories/user.repository";

const repo = new UserRepository();
const authService = new AuthService(repo);

const router = Router();

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

export default router;
