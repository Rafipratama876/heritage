import { getDevice, getSessionId, getVisitorId } from '@/lib/visitor';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect } from 'react';

// Fires a lightweight, anonymous pageview ping on every route change, to
// power the admin "Visitor Insight" dashboard. No cookies, no IP or
// location stored — just a random id kept in localStorage. Mounted once
// in app.jsx's layout wrapper, keyed off Inertia's current URL.
export default function VisitorTracker() {
    const { url } = usePage();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (url.startsWith('/admin')) return; // don't track our own admin usage

        axios
            .post('/api/track', {
                visitor_id: getVisitorId(),
                session_id: getSessionId(),
                path: url,
                device: getDevice(),
            })
            .catch(() => {
                // Tracking is best-effort — never surface this to the visitor.
            });
    }, [url]);

    return null;
}
