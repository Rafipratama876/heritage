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

// Separate config for product videos: one file at a time, much larger
// size ceiling than photos, and a distinct mimetype allow-list. Shares
// the same disk destination/filename scheme (and therefore the same
// "/uploads/..." serving route in index.ts) as image uploads above.
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/ogg", "video/quicktime"]);
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const uploadVideo = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_VIDEO_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, "Only MP4, WEBM, OGG, or MOV videos are allowed"));
      return;
    }
    cb(null, true);
  },
});

// POST /api/uploads/video — admin only. Accepts a single file under the
// "file" field. Returns the same "/uploads/..." shape as the image
// endpoint above, just with exactly one URL.
router.post(
  "/video",
  requireAuth,
  requireAdmin,
  (req, res, next) => {
    uploadVideo.single("file")(req, res, (err) => {
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
    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: "No file was uploaded" });
    }
    res.status(201).json({ url: `/uploads/${file.filename}` });
  }
);

export default router;
