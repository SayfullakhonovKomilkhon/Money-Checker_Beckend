import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/goals.controller";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0).optional(),
  due_date: z.string().min(1),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  target_amount: z.number().positive().optional(),
  current_amount: z.number().min(0).optional(),
  due_date: z.string().optional(),
});

router.get("/", requireAuth, ctrl.listGoals);
router.get("/:id", requireAuth, ctrl.getGoal);
router.post("/", requireAuth, validate(createSchema), ctrl.createGoal);
router.put("/:id", requireAuth, validate(updateSchema), ctrl.updateGoal);
router.delete("/:id", requireAuth, ctrl.deleteGoal);

export default router;
