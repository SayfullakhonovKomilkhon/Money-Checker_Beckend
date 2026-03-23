import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/auth.controller";

const router = Router();

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

router.post("/signup", validate(signUpSchema), ctrl.signUp);
router.post("/signin", validate(signInSchema), ctrl.signIn);
router.post("/refresh", validate(refreshSchema), ctrl.refreshToken);
router.get("/me", requireAuth, ctrl.getMe);

export default router;
