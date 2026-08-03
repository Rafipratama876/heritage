// Data comes from the backend API (see lib/api.ts) instead of a static
// in-memory array. These re-exports keep the same function names so pages
// don't need major rewrites — just `await` them, since they're async.
export {
  getProducts,
  getFeaturedProducts,
  getProduct,
  getRelatedProducts,
} from "./api";
