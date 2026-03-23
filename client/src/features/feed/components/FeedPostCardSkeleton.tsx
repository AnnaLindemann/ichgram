import { Skeleton } from "@/components/ui/skeleton";

export function FeedPostCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-[20px] border border-[#dbdbdb] bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-gray-300" />
            <Skeleton className="h-3 w-16 bg-gray-300" />
          </div>
        </div>

        <Skeleton className="h-4 w-12 bg-gray-300" />
      </div>

      <Skeleton className="aspect-square w-full bg-gray-300" />

      <div className="px-4 pb-4 pt-3">
        <div className="mb-3 flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-sm" />
          <Skeleton className="h-6 w-6 rounded-sm" />
          <Skeleton className="h-6 w-6 rounded-sm" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </article>
  );
}