export function Skeleton({ className = "", delay = 0 }) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      aria-hidden="true"
    />
  );
}

export function SkeletonGrid({
  count = 3,
  className = "",
  itemClassName = "h-28",
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          className={itemClassName}
          delay={index * 70}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="grid gap-3 p-5" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton
          key={index}
          className="h-10 rounded-md"
          delay={index * 70}
        />
      ))}
    </div>
  );
}
