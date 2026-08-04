// Shared with components/VisitorTracker.tsx — the same anonymous,
// long-lived id (no cookies, no IP) used to link PageView, SearchQuery,
// and ProductEvent rows back to "the same browser" for insights like
// repeat view / new vs returning visitor.
const VISITOR_ID_KEY = "rizal_heritage_visitor_id";

export function getVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}
