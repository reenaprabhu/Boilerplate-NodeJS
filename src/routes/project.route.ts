import { Router } from "express";
import { ProjectRepository } from "../repositories/project.repository";
import { ProjectService } from "../services/project.service";
import { ProjectController } from "../controllers/project.controller";
import { requireRoles } from "../middleware/rbac";

const repo = new ProjectRepository();
const service = new ProjectService(repo);
const controller = new ProjectController(service);

const router = Router();

router.get("/", requireRoles("admin"), controller.getAll);
router.get("/:id", controller.getById);
router.get("/owner/:ownerId", controller.getByOwner);
router.post("/", requireRoles("admin", "manager"), controller.create);
router.put("/:id", requireRoles("admin", "manager"), controller.update);
router.delete("/:id", requireRoles("admin"), controller.delete);

export default router;
