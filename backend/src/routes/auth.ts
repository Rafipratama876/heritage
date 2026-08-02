import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";
import { requireAuth } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    const { name, email, password, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone },
    });

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  })
);

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors.map((e) => e.message).join(", "));
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: now, lastSeenAt: now },
      }),
      prisma.loginEvent.create({ data: { userId: user.id } }),
    ]);

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  })
);

// POST /api/auth/heartbeat — called periodically by logged-in sessions
// while the site is open, so the admin dashboard can report how many
// users are online right now (lastSeenAt within the last few minutes).
router.post(
  "/heartbeat",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.user.update({
      where: { id: req.user!.sub },
      data: { lastSeenAt: new Date() },
    });
    res.status(204).send();
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw new ApiError(404, "User not found");
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  })
);

export default router;
