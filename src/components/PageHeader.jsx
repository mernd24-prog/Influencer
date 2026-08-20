import {
  Plus,
  RefreshCw,
} from "lucide-react";

export default function PageHeader({
  title,
  subtitle,
  loading = false,
  onRefresh,
  actionLabel,
  onAction,
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      {/* Title & Subtitle */}
      <div className="min-w-0">
        <h1 className="m-0 text-[20px] font-semibold leading-tight text-[#211b62]">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1.5 text-[13px] leading-4 text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#dca719] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#c79715]"
          >
            <Plus
              size={15}
              strokeWidth={2}
            />

            {actionLabel}
          </button>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#dca719] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#c79715] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              strokeWidth={2}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        )}
      </div>
    </div>
  );
}