import { Skeleton, SkeletonGrid } from "./Skeleton";

const HeaderSkeleton = () => (
  <div className="mb-5 flex items-start justify-between gap-4">
    <div className="grid w-full max-w-sm gap-2">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-4 w-full" />
    </div>
    <Skeleton className="h-9 w-24" />
  </div>
);

export function DashboardSkeleton() {
  return (
    <div aria-label="Loading dashboard" role="status">
      <HeaderSkeleton />
      <SkeletonGrid count={6} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-[330px]" />
        <Skeleton className="h-[330px]" delay={70} />
      </div>
      <Skeleton className="mt-5 h-56" />
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div aria-label="Loading performance" role="status">
      <HeaderSkeleton />
      <SkeletonGrid count={6} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" />
      <Skeleton className="mb-5 h-36" />
      <Skeleton className="h-[360px]" />
    </div>
  );
}

export function WithdrawalsSkeleton() {
  return (
    <div aria-label="Loading wallet and payouts" role="status">
      <HeaderSkeleton />
      <SkeletonGrid count={3} className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[420px]" delay={70} />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="grid gap-4" aria-label="Loading profile" role="status">
      <Skeleton className="h-16" />
      <SkeletonGrid count={2} className="grid grid-cols-1 gap-4 md:grid-cols-2" />
      <Skeleton className="h-40" delay={120} />
      <Skeleton className="h-[300px]" delay={180} />
    </div>
  );
}
