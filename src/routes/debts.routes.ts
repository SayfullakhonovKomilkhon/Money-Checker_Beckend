import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/debts.controller";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  due_date: z.string().min(1),
  status: z.enum(["pending", "paid", "overdue", "partial"]).optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  due_date: z.string().optional(),
  status: z.enum(["pending", "paid", "overdue", "partial"]).optional(),
});

router.get("/", requireAuth, ctrl.listDebts);
router.get("/:id", requireAuth, ctrl.getDebt);
router.post("/", requireAuth, validate(createSchema), ctrl.createDebt);
router.put("/:id", requireAuth, validate(updateSchema), ctrl.updateDebt);
router.delete("/:id", requireAuth, ctrl.deleteDebt);

export default router;
