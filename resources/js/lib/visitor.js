// Shared with Components/VisitorTracker.jsx — the same anonymous,
// long-lived id (no cookies, no IP) used to link page_views, search_queries,
// and product_events rows back to "the same browser" for insights like
// repeat view / new vs returning visitor.
const VISITOR_ID_KEY = 'rizal_heritage_visitor_id';

function randomId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getVisitorId() {
    if (typeof window === 'undefined') return null;
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
        id = randomId();
        localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
}

const SESSION_ID_KEY = 'rizal_heritage_session_id';
const SESSION_LAST_ACTIVITY_KEY = 'rizal_heritage_session_last_activity';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity = new session

export function getSessionId() {
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

export function getDevice() {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}
