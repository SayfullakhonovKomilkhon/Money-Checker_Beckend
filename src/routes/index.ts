import { Router } from "express";

import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import balanceRoutes from "./balance.routes";
import categoriesRoutes from "./categories.routes";
import transactionsRoutes from "./transactions.routes";
import goalsRoutes from "./goals.routes";
import savingsGoalsRoutes from "./savingsGoals.routes";
import debtsRoutes from "./debts.routes";
import notificationsRoutes from "./notifications.routes";
import plannedExpensesRoutes from "./plannedExpenses.routes";
import savingsRoutes from "./savings.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/balance", balanceRoutes);
router.use("/categories", categoriesRoutes);
router.use("/transactions", transactionsRoutes);
router.use("/goals", goalsRoutes);
router.use("/savings-goals", savingsGoalsRoutes);
router.use("/debts", debtsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/planned-expenses", plannedExpensesRoutes);
router.use("/savings", savingsRoutes);

export default router;
