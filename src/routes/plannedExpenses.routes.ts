import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/plannedExpenses.controller";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().min(1),
  notification_enabled: z.boolean().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().optional(),
  notification_enabled: z.boolean().optional(),
});

router.get("/", requireAuth, ctrl.listPlannedExpenses);
router.get("/:id", requireAuth, ctrl.getPlannedExpense);
router.post("/", requireAuth, validate(createSchema), ctrl.createPlannedExpense);
router.put("/:id", requireAuth, validate(updateSchema), ctrl.updatePlannedExpense);
router.delete("/:id", requireAuth, ctrl.deletePlannedExpense);

export default router;
