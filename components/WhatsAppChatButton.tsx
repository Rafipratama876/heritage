"use client";

import { useRouter, usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppLink } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";

// General "chat with us on WhatsApp" entry point (contact page, etc.) —
// gated the same way as WhatsAppOrderButton.tsx / CartDrawer.tsx's
// checkout link, so every WhatsApp touchpoint on the site requires a
// login first.
export default function WhatsAppChatButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!isAuthenticated) {
      e.preventDefault();
      showToast("Please log in to chat with us on WhatsApp.", "info");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }

  return (
    <a
      href={buildWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn("btn-primary", className)}
    >
      <FaWhatsapp /> {children ?? "Chat on WhatsApp"}
    </a>
  );
}
