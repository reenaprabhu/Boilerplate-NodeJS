import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repositories/user.repository";
import { requireRoles } from "../middleware/rbac";

const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);

const router = Router();

router.get("/", requireRoles("admin"), controller.getAll);
router.get("/:id", controller.getById);
router.post("/", requireRoles("admin"), controller.create);
router.put("/:id", requireRoles("admin"), controller.update);
router.delete("/:id", requireRoles("admin"), controller.delete);

export default router;
