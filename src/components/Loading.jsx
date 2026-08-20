import React from "react";
import { createPortal } from "react-dom";

const Loader = ({
  loading = true,
  fullScreen = true,
  label,
}) => {
  if (!loading) return null;

  const loader = (
    <div
      className={`${
        fullScreen
          ? "fixed inset-0 z-[11000] bg-black/40 backdrop-blur-[2px]"
          : "min-h-[180px]"
      } flex items-center justify-center`}
      role="status"
      aria-label={label || "Loading"}
    >
      <div className="flex flex-col items-center gap-3 px-6 py-5">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#f1e7cd] border-t-[#dca719]" />

        {label && (
          <span className="text-[12px] font-medium text-[#211b62]">
            {label}
          </span>
        )}
      </div>
    </div>
  );

  if (
    fullScreen &&
    typeof document !== "undefined"
  ) {
    return createPortal(
      loader,
      document.body
    );
  }

  return loader;
};

export default React.memo(Loader);
