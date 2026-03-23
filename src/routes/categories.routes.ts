import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/categories.controller";

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

router.get("/", requireAuth, ctrl.listCategories);
router.get("/:id", requireAuth, ctrl.getCategory);
router.post("/", requireAuth, validate(createSchema), ctrl.createCategory);
router.put("/:id", requireAuth, validate(updateSchema), ctrl.updateCategory);
router.delete("/:id", requireAuth, ctrl.deleteCategory);

export default router;
