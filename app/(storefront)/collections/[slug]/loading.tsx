import { ProductGridSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="container-content pt-32 pb-24">
      <div className="mb-12 max-w-2xl animate-pulse">
        <div className="aspect-[21/9] bg-surface border border-line mb-8" />
        <div className="h-3 w-24 bg-surface mb-3" />
        <div className="h-10 w-64 bg-surface" />
      </div>
      <ProductGridSkeleton count={6} />
    </div>
  );
}
