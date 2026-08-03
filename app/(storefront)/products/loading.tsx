import { ProductGridSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="container-content pt-32 pb-24">
      <div className="mb-12 max-w-2xl animate-pulse">
        <div className="h-3 w-24 bg-surface mb-3" />
        <div className="h-10 w-64 bg-surface" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        <div className="hidden lg:block h-64 bg-surface animate-pulse" />
        <ProductGridSkeleton count={9} />
      </div>
    </div>
  );
}
