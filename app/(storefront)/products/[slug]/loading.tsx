import { Spinner } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="container-content pt-32 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-[4/5] bg-surface border border-line" />
        <div className="space-y-4 pt-4">
          <div className="h-3 w-20 bg-surface" />
          <div className="h-8 w-3/4 bg-surface" />
          <div className="h-5 w-32 bg-surface" />
          <div className="h-24 w-full bg-surface" />
          <div className="flex items-center gap-3 pt-4">
            <Spinner className="w-5 h-5" />
            <span className="text-muted text-sm">Loading product…</span>
          </div>
        </div>
      </div>
    </div>
  );
}
