export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890"; // fallback for local dev

// `productUrl` is passed in by the caller (built from `window.location`,
// client-side) rather than read from a hardcoded site-URL constant here —
// see the callers in WhatsAppOrderButton.tsx / CartDrawer.tsx — so the
// link is always correct for whatever domain the site is actually
// running on (prod, staging, localhost), with no config to keep in sync.
export function buildWhatsAppLink(productName?: string, productUrl?: string): string {
  const message = productName
    ? `Hello,\nI'm interested in this product:\n\n${productName}${
        productUrl ? `\n${productUrl}` : ""
      }\n\nCan I get more information?`
    : `Hello, I'd like to know more about Rizal Heritage products.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppCartLink(
  items: { name: string; quantity: number; price: number; slug?: string }[],
  totalPrice: number,
  siteOrigin?: string
): string {
  const lines = items
    .map((i) => {
      const link = siteOrigin && i.slug ? `\n${siteOrigin}/products/${i.slug}` : "";
      return `${i.quantity}x ${i.name} — ${formatIDR(i.price * i.quantity)}${link}`;
    })
    .join("\n\n");
  const message = `Hello, I'd like to order the following:\n\n${lines}\n\nTotal: ${formatIDR(
    totalPrice
  )}\n\nCan you help me proceed with this order?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
