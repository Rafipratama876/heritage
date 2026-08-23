export function ProductCardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[4/5] bg-surface border border-line" />
            <div className="mt-4 h-3 w-16 bg-surface" />
            <div className="mt-2 h-4 w-3/4 bg-surface" />
            <div className="mt-3 h-3 w-24 bg-surface" />
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function Spinner({ className = '' }) {
    return (
        <div
            role="status"
            aria-label="Loading"
            className={`w-5 h-5 border-2 border-line border-t-brass rounded-full animate-spin ${className}`}
        />
    );
}
