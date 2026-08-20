import { TrendingUp } from "lucide-react";

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  iconBg = "#E7EDFF",
  iconColor = "#0F4BB3",
  subtitle,
  trend,
  trendLabel,
  showTrend = false,
  className = "",
}) {
  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-lg border border-[#eadfce] border-l-[3px] border-l-[#dca719] bg-white px-3 py-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm ${className}`}
    >
      {/* Icon */}
      {Icon && (
        <div
          className="absolute right-0 top-0 flex h-10 w-11 items-center justify-center rounded-bl-xl"
          style={{
            backgroundColor: iconBg,
            color: iconColor,
          }}
        >
          <Icon size={20} strokeWidth={1.9} />
        </div>
      )}

      {/* Title */}
      <p className="mb-1 max-w-[75%] truncate text-[12px] font-semibold text-[#22202b]">
        {title}
      </p>

      {/* Value */}
      <h3 className="m-0 mt-1 text-[21px] font-bold leading-tight text-[#1f1b5f]">
        {value}
      </h3>

      {/* Bottom info */}
      <div className="mt-2 flex min-h-[18px] items-center gap-1.5">
        {showTrend && trend ? (
          <>
            <TrendingUp
              size={12}
              strokeWidth={2}
              className="text-emerald-500"
            />

            <span className="text-[10px] font-semibold text-emerald-500">
              {trend}
            </span>

            {trendLabel && (
              <span className="text-[10px] text-gray-500">
                {trendLabel}
              </span>
            )}
          </>
        ) : (
          <span className="truncate text-[10px] text-gray-500">
            {subtitle || "Live referral data"}
          </span>
        )}
      </div>
    </article>
  );
}