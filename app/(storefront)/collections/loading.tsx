export default function Loading() {
  return (
    <div className="container-content pt-32 pb-24">
      <div className="mb-12 max-w-2xl animate-pulse">
        <div className="h-3 w-24 bg-surface mb-3" />
        <div className="h-10 w-64 bg-surface" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[16/10] bg-surface border border-line" />
        ))}
      </div>
    </div>
  );
}
