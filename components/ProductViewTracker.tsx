"use client";

import { useEffect } from "react";
import { trackProductEvent } from "@/lib/api";

// Fires a VIEW event once per product page load, to power the admin
// "Product Insight" dashboard (view counts, ranking, repeat view).
// A separate client component since the product page itself is a server
// component (it fetches product data directly from the DB).
export default function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    trackProductEvent(productId, "VIEW");
  }, [productId]);

  return null;
}
