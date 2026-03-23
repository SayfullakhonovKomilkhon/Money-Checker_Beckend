import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/balance.controller";

const router = Router();

const updateBalanceSchema = z.object({
  balance: z.number(),
  currency: z.string().optional(),
});

router.get("/", requireAuth, ctrl.getBalance);
router.put("/", requireAuth, validate(updateBalanceSchema), ctrl.updateBalance);

export default router;
