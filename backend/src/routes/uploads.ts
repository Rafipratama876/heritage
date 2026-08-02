import path from "path";
import crypto from "crypto";
import { Router } from "express";
import multer from "multer";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { ApiError } from "../utils/asyncHandler";

const router = Router();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString("hex");
    cb(null, `${name}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, "Only JPG, PNG, WEBP, or GIF images are allowed"));
      return;
    }
    cb(null, true);
  },
});

// POST /api/uploads — admin only. Accepts up to 10 files under the
// "files" field (multipart/form-data). Returns paths relative to this
// API's origin — the frontend prefixes them with its known API base URL
// before storing/displaying them (see lib/api.ts).
router.post(
  "/",
  requireAuth,
  requireAdmin,
  (req, res, next) => {
    upload.array("files", MAX_FILES)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.message });
        }
        return next(err);
      }
      next();
    });
  },
  (req, res) => {
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }
    const urls = files.map((f) => `/uploads/${f.filename}`);
    res.status(201).json({ urls });
  }
);

export default router;
