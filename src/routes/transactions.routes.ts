import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/transactions.controller";

const router = Router();

const createSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  amount: z.number().positive(),
  description: z.string().optional(),
  transaction_date: z.string().optional(),
  transaction_type: z.enum(["income", "expense"]),
  input_method: z.enum(["manual", "automatic", "import"]).optional(),
});

const updateSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  transaction_date: z.string().optional(),
  transaction_type: z.enum(["income", "expense"]).optional(),
});

router.get("/", requireAuth, ctrl.listTransactions);
router.get("/with-categories", requireAuth, ctrl.listTransactionsWithCategories);
router.get("/:id", requireAuth, ctrl.getTransaction);
router.post("/", requireAuth, validate(createSchema), ctrl.createTransaction);
router.put("/:id", requireAuth, validate(updateSchema), ctrl.updateTransaction);
router.delete("/:id", requireAuth, ctrl.deleteTransaction);

export default router;
