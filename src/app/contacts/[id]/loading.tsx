import { Skeleton } from "@/components/ui/skeleton";

export default function ContactDetailLoading() {
  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Left column skeleton */}
      <div className="w-full shrink-0 space-y-6 border-b p-6 lg:w-[380px] lg:border-b-0 lg:border-r">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
      {/* Center column skeleton */}
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
      {/* Right column skeleton */}
      <div className="hidden w-[320px] shrink-0 space-y-4 border-l p-6 lg:block">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}
