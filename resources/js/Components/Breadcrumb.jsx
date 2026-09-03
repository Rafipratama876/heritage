import { Link } from '@inertiajs/react';
import { HiChevronRight } from 'react-icons/hi';

export default function Breadcrumb({ items }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-8">
            {/* Color per client spec: CMYK 54.9/65.1/81.57/67.45 → #251D0F
                (was text-muted, which read as too washed-out against the
                hero pattern background on several pages). */}
            <ol className="flex flex-wrap items-center gap-2 text-xs text-[#251D0F]">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;
                    return (
                        <li key={item.label} className="flex items-center gap-2">
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className="hover:text-brass transition-colors tracking-wide"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span aria-current={isLast ? 'page' : undefined} className="tracking-wide">
                                    {item.label}
                                </span>
                            )}
                            {!isLast && <HiChevronRight className="text-line" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
