export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281234567890"; // fallback for local dev

export function buildWhatsAppLink(productName?: string): string {
  const message = productName
    ? `Hello,\nI'm interested in this product:\n\n${productName}\n\nCan I get more information?`
    : `Hello, I'd like to know more about Rizal Heritage products.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppCartLink(
  items: { name: string; quantity: number; price: number }[],
  totalPrice: number
): string {
  const lines = items
    .map((i) => `${i.quantity}x ${i.name} — ${formatIDR(i.price * i.quantity)}`)
    .join("\n");
  const message = `Hello, I'd like to order the following:\n\n${lines}\n\nTotal: ${formatIDR(
    totalPrice
  )}\n\nCan you help me proceed with this order?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
