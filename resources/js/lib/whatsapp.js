import { formatIDR } from './format';

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';

export function buildWhatsAppLink(productName, productUrl) {
    const message = productName
        ? `Hello,\nI'm interested in this product:\n\n${productName}${
              productUrl ? `\n${productUrl}` : ''
          }\n\nCan I get more information?`
        : 'Hello, I\'d like to know more about Rizal Heritage products.';

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppCartLink(items, totalPrice, siteOrigin) {
    const lines = items
        .map((item) => {
            const link = siteOrigin && item.slug ? `\n${siteOrigin}/products/${item.slug}` : '';
            return `${item.quantity}x ${item.name} — ${formatIDR(item.price * item.quantity)}${link}`;
        })
        .join('\n\n');

    const message = `Hello, I'd like to order the following:\n\n${lines}\n\nTotal: ${formatIDR(
        totalPrice
    )}\n\nCan you help me proceed with this order?`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
