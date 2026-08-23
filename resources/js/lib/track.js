import axios from 'axios';
import { getVisitorId } from './visitor';

export function trackProductEvent(productId, type) {
    axios
        .post('/api/track/product', {
            product_id: productId,
            type,
            visitor_id: getVisitorId(),
        })
        .catch(() => {
            // Tracking is best-effort — never surface this to the visitor.
        });
}

export function trackSearch(query, resultsCount) {
    axios.post('/api/track/search', { query, results_count: resultsCount }).catch(() => {});
}
