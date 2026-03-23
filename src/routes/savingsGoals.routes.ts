import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/savingsGoals.controller";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0).optional(),
  monthly_contribution: z.number().min(0).optional(),
  deadline: z.string().min(1),
  category: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  target_amount: z.number().positive().optional(),
  current_amount: z.number().min(0).optional(),
  monthly_contribution: z.number().min(0).optional(),
  deadline: z.string().optional(),
  category: z.string().optional(),
});

router.get("/", requireAuth, ctrl.listSavingsGoals);
router.get("/:id", requireAuth, ctrl.getSavingsGoal);
router.post("/", requireAuth, validate(createSchema), ctrl.createSavingsGoal);
router.put("/:id", requireAuth, validate(updateSchema), ctrl.updateSavingsGoal);
router.delete("/:id", requireAuth, ctrl.deleteSavingsGoal);

export default router;
