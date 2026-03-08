import { Skeleton } from "@/components/ui/skeleton";

export default function DealsLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Filter bar skeleton */}
      <div className="flex items-center gap-3 border-b px-6 py-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
      {/* Table skeleton */}
      <div className="flex-1 p-6">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
