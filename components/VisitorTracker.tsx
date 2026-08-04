"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BROWSER_API_URL } from "@/lib/api";
import { getVisitorId } from "@/lib/visitor";

const SESSION_ID_KEY = "rizal_heritage_session_id";
const SESSION_LAST_ACTIVITY_KEY = "rizal_heritage_session_last_activity";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity = new session

function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getSessionId(): string {
  const now = Date.now();
  const lastActivity = Number(localStorage.getItem(SESSION_LAST_ACTIVITY_KEY) ?? 0);
  let id = localStorage.getItem(SESSION_ID_KEY);

  if (!id || now - lastActivity > SESSION_TIMEOUT_MS) {
    id = randomId();
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(now));
  return id;
}

function getDevice(): "desktop" | "mobile" {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

// Fires a lightweight, anonymous pageview ping on every route change, to
// power the admin "Visitor Insight" dashboard. No cookies, no IP or
// location stored — just a random id kept in localStorage.
export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/admin")) return; // don't track our own admin usage

    const payload = {
      visitorId: getVisitorId() as string,
      sessionId: getSessionId(),
      path: pathname,
      device: getDevice(),
    };

    fetch(`${BROWSER_API_URL}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Tracking is best-effort — never surface this to the visitor.
    });

    // GA4's automatic pageview is turned off (see GoogleAnalytics.tsx),
    // so it's fired manually here — same route-change trigger and same
    // /admin exclusion as our own tracking above.
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", "page_view", { page_path: pathname });
    }
  }, [pathname]);

  return null;
}
