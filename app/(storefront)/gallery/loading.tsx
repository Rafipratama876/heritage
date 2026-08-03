export default function Loading() {
  return (
    <div className="container-content pt-32 pb-24">
      <div className="mb-12 max-w-2xl animate-pulse">
        <div className="h-3 w-24 bg-surface mb-3" />
        <div className="h-10 w-64 bg-surface" />
      </div>
      <div className="columns-2 md:columns-3 gap-5 animate-pulse [&>div]:mb-5 [&>div]:break-inside-avoid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-line"
            style={{ height: `${180 + (i % 3) * 60}px` }}
          />
        ))}
      </div>
    </div>
  );
}
