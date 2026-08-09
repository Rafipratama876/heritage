"use client";

import { useRouter, usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppLink } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { trackProductEvent } from "@/lib/api";

// Ordering (unlike browsing, adding to cart, or wishlisting) requires an
// account — this button redirects to /login with a `redirect` back to the
// current page instead of opening WhatsApp when the visitor is a guest.
export default function WhatsAppOrderButton({
  productId,
  productName,
  className,
}: {
  productId?: string;
  productName?: string;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!isAuthenticated) {
      e.preventDefault();
      showToast("Please log in to place an order.", "info");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    // Swap in the page-URL-aware href right before the browser follows
    // it. Built here (not at render time) so server and first client
    // render produce the same markup — window.location isn't available
    // on the server, and reading it during render would cause a
    // hydration mismatch on this attribute.
    e.currentTarget.href = buildWhatsAppLink(productName, window.location.href);
    if (productId) trackProductEvent(productId, "WA_CLICK");
  }

  return (
    <a
      href={buildWhatsAppLink(productName)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "btn-primary w-full sm:w-auto text-base !py-4",
        className,
      )}
    >
      <FaWhatsapp className="text-lg" />
      Order via WhatsApp
    </a>
  );
}
