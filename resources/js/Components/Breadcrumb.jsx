import { Link } from '@inertiajs/react';
import { HiChevronRight } from 'react-icons/hi';

export default function Breadcrumb({ items }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-muted">
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
                                <span
                                    aria-current={isLast ? 'page' : undefined}
                                    className={isLast ? 'text-ivory tracking-wide' : 'tracking-wide'}
                                >
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
