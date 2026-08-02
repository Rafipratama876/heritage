"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineShoppingBag, HiHeart, HiOutlineHeart } from "react-icons/hi";
import { Product } from "@/types";
import { formatIDR, cn } from "@/lib/utils";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="label-frame relative overflow-hidden bg-surface aspect-[4/5]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 font-mono text-[10px] tracking-widest2 text-brass bg-canvas/80 px-2 py-1">
            {product.code}
          </span>
          <button
            type="button"
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            onClick={handleToggleWishlist}
            className={cn(
              "absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-canvas/90 transition-colors",
              wishlisted
                ? "text-clay opacity-100"
                : "text-ivory hover:text-clay opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            )}
          >
            {wishlisted ? <HiHeart className="text-base" /> : <HiOutlineHeart className="text-base" />}
          </button>
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center bg-canvas/90 text-ivory hover:bg-brass hover:text-canvas transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <HiOutlineShoppingBag className="text-base" />
          </button>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-1">{product.categories.join(" · ")}</p>
            <h3 className="font-display text-lg text-ivory leading-snug">
              {product.name}
            </h3>
          </div>
        </div>
        <p className="font-mono text-sm text-muted mt-2">
          {formatIDR(product.price)}
        </p>
      </Link>
    </motion.div>
  );
}
