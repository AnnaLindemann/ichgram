import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-8 px-4 py-6">
      <Skeleton className="h-20 w-20 rounded-full" />

      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-32" />

        <div className="flex gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}