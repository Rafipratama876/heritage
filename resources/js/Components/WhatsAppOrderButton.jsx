import { useToast } from '@/Providers/ToastProvider';
import { trackProductEvent } from '@/lib/track';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { router, usePage } from '@inertiajs/react';
import { FaWhatsapp } from 'react-icons/fa';

// Ordering (unlike browsing, adding to cart, or wishlisting) requires an
// account — this button redirects to /login with a redirect back to the
// current page instead of opening WhatsApp when the visitor is a guest.
export default function WhatsAppOrderButton({ productId, productName, className = '' }) {
    const page = usePage();
    const auth = page.props.auth;
    const { showToast } = useToast();

    function handleClick(e) {
        if (!auth?.user) {
            e.preventDefault();
            showToast('Please log in to place an order.', 'info');
            router.visit(`/login?redirect=${encodeURIComponent(page.url)}`);
            return;
        }
        e.currentTarget.href = buildWhatsAppLink(productName, window.location.href);
        if (productId) trackProductEvent(productId, 'wa_click');
    }

    return (
        <a
            href={buildWhatsAppLink(productName)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`btn-primary w-full sm:w-auto text-base !py-4 ${className}`}
        >
            <FaWhatsapp className="text-lg" />
            Order via WhatsApp
        </a>
    );
}
