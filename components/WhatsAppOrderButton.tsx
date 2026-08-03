"use client";

import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppLink } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function WhatsAppOrderButton({
  productName,
  className,
}: {
  productName?: string;
  className?: string;
}) {
  return (
    <a
      href={buildWhatsAppLink(productName)}
      target="_blank"
      rel="noopener noreferrer"
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
