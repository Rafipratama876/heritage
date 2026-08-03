import { Spinner } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Spinner className="w-8 h-8" />
    </div>
  );
}
