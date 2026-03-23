import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/notifications.controller";

const router = Router();

const createSchema = z.object({
  type: z.enum(["goal", "expense", "reminder", "limit"]),
  message: z.string().min(1),
  related_goal_id: z.string().uuid().nullable().optional(),
  related_limit_id: z.string().uuid().nullable().optional(),
});

router.get("/", requireAuth, ctrl.listNotifications);
router.post("/", requireAuth, validate(createSchema), ctrl.createNotification);
router.put("/:id/read", requireAuth, ctrl.markAsRead);
router.put("/read-all", requireAuth, ctrl.markAllAsRead);
router.delete("/:id", requireAuth, ctrl.deleteNotification);

export default router;
