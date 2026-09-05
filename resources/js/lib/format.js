export function formatIDR(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

// USD price is a separate value the admin types in manually (no
// auto-conversion from the IDR price) — see products.price_usd.
export function formatUSD(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

export function hasUsdPrice(value) {
    return value !== null && value !== undefined;
}

// Text shown wherever a price would normally appear, for products the
// admin has deliberately left priceless ("contact us for price").
export const CONTACT_FOR_PRICE = 'Hubungi Kami';

// Formats a product's price for display, or returns the "contact us"
// label when the product has no price set (price is nullable — see
// database/migrations/2026_08_24_164955_make_price_nullable_on_products_table.php).
export function formatPrice(value) {
    return value === null || value === undefined ? CONTACT_FOR_PRICE : formatIDR(value);
}

export function hasPrice(value) {
    return value !== null && value !== undefined;
}
