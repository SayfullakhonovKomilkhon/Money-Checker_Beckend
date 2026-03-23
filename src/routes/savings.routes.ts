import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/savings.controller";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  type: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  type: z.string().optional(),
});

router.get("/", requireAuth, ctrl.listSavings);
router.get("/:id", requireAuth, ctrl.getSaving);
router.post("/", requireAuth, validate(createSchema), ctrl.createSaving);
router.put("/:id", requireAuth, validate(updateSchema), ctrl.updateSaving);
router.delete("/:id", requireAuth, ctrl.deleteSaving);

export default router;
