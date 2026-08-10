import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import collectionRoutes from "./routes/collections";
import galleryRoutes from "./routes/gallery";
import cartRoutes from "./routes/cart";
import wishlistRoutes from "./routes/wishlist";
import userRoutes from "./routes/users";
import uploadRoutes from "./routes/uploads";
import analyticsRoutes from "./routes/analytics";
import trackRoutes from "./routes/track";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { scheduleInsightCleanup } from "./jobs/cleanupInsight";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",");

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Serves uploaded product/collection/gallery images. The upload route
// (routes/uploads.ts) writes files into this same directory.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/track", trackRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Rizal Heritage API listening on port ${PORT}`);
});

// Daily job that purges raw Insight event rows (logins, page views,
// search queries, product events) older than the retention window —
// see backend/src/jobs/cleanupInsight.ts for what that means for the
// admin dashboard's all-time totals.
scheduleInsightCleanup();
