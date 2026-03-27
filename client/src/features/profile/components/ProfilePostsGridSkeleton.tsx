import { Skeleton } from "@/components/ui/skeleton";

export function ProfilePostsGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 px-4">
      {Array.from({ length: 9 }).map((_, index) => (
        <Skeleton
          key={index}
          className="aspect-square w-full"
        />
      ))}
    </div>
  );
}