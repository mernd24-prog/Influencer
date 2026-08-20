export default function SectionCard({
  title,
  subtitle,
  icon,
  actions,
  children,
  className = "",
  headerClassName = "",
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-[#eadfce] bg-white shadow-[0_1px_3px_rgba(31,27,95,0.04)] ${className}`}
    >
      {(title || subtitle || icon || actions) && (
        <div
          className={`flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 ${headerClassName}`}
        >
          <div className="flex min-w-0 items-start gap-3">
            {icon}
            <div className="min-w-0">
              {title && (
                <h2 className="text-[15px] font-semibold text-[#211b62]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-[11px] leading-5 text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
