import { useCart } from '@/Providers/CartProvider';
import { useWishlist } from '@/Providers/WishlistProvider';
import { formatIDR } from '@/lib/format';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineTrash, HiX } from 'react-icons/hi';

export default function WishlistDrawer() {
    const { items, isOpen, closeWishlist, removeItem } = useWishlist();
    const { addItem } = useCart();
    const isEmpty = items.length === 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[90] bg-black/60"
                        onClick={closeWishlist}
                    />
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed top-0 right-0 z-[95] h-full w-full max-w-md bg-canvas border-l border-line flex flex-col"
                        role="dialog"
                        aria-label="Wishlist"
                    >
                        <div className="flex items-center justify-between px-6 h-20 border-b border-line shrink-0">
                            <h2 className="font-display text-xl text-ivory">
                                Wishlist{' '}
                                {items.length > 0 && (
                                    <span className="font-mono text-sm text-brass">
                                        ({items.length})
                                    </span>
                                )}
                            </h2>
                            <button
                                type="button"
                                aria-label="Close wishlist"
                                onClick={closeWishlist}
                                className="text-ivory/70 hover:text-ivory text-2xl p-1"
                            >
                                <HiX />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {isEmpty ? (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-16">
                                    <HiOutlineHeart className="text-4xl text-muted" />
                                    <p className="text-muted">Your wishlist is empty.</p>
                                    <Link
                                        href="/products"
                                        onClick={closeWishlist}
                                        className="btn-outline !px-5 !py-2.5 text-xs mt-2"
                                    >
                                        Browse Products
                                    </Link>
                                </div>
                            ) : (
                                <ul className="space-y-6">
                                    {items.map((item) => (
                                        <li key={item.productId} className="flex gap-4">
                                            <Link
                                                href={`/products/${item.slug}`}
                                                onClick={closeWishlist}
                                                className="relative w-20 h-24 shrink-0 bg-surface border border-line overflow-hidden"
                                            >
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/products/${item.slug}`}
                                                    onClick={closeWishlist}
                                                    className="font-display text-base text-ivory leading-snug hover:text-brass transition-colors line-clamp-2"
                                                >
                                                    {item.name}
                                                </Link>
                                                <p className="font-mono text-sm text-muted mt-1">
                                                    {formatIDR(item.price)}
                                                </p>

                                                <div className="flex items-center gap-3 mt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            addItem(
                                                                {
                                                                    id: item.productId,
                                                                    slug: item.slug,
                                                                    name: item.name,
                                                                    price: item.price,
                                                                    images: item.image ? [item.image] : [],
                                                                },
                                                                1
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 text-xs text-ivory/80 hover:text-brass transition-colors border border-line px-3 py-1.5"
                                                    >
                                                        <HiOutlineShoppingBag /> Add to cart
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label={`Remove ${item.name} from wishlist`}
                                                        onClick={() => removeItem(item.productId)}
                                                        className="text-ivory/50 hover:text-red-500 transition-colors p-1.5"
                                                    >
                                                        <HiOutlineTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
