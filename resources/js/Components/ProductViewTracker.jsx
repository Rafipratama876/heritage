import { trackProductEvent } from '@/lib/track';
import { useEffect } from 'react';

// Fires a "view" event once per product page load, to power the admin
// "Product Insight" dashboard (view counts, ranking, repeat view).
export default function ProductViewTracker({ productId }) {
    useEffect(() => {
        trackProductEvent(productId, 'view');
    }, [productId]);

    return null;
}
