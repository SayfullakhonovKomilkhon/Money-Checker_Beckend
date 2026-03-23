import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/users.controller";

const router = Router();

const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
});

router.get("/profile", requireAuth, ctrl.getProfile);
router.put("/profile", requireAuth, validate(updateProfileSchema), ctrl.updateProfile);

export default router;
