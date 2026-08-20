import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ThemedSelect from "./ThemedSelect";

const getVisiblePages = (currentPage, totalPages) => {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, Math.max(currentPage + 2, 5));
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export default function Pagination({
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 20,
  loading = false,
  onPageChange,
  onPageSizeChange,
}) {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safePage = Math.min(Math.max(1, Number(page) || 1), safeTotalPages);
  const firstRecord = total ? (safePage - 1) * pageSize + 1 : 0;
  const lastRecord = total
    ? Math.min(firstRecord + pageSize - 1, total)
    : 0;
  const visiblePages = getVisiblePages(safePage, safeTotalPages);

  const goTo = (nextPage) => {
    if (!loading && nextPage !== safePage) onPageChange(nextPage);
  };

  const navButton =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:border-[#dca719]/50 hover:bg-[#fffaf0] hover:text-[#211b62] disabled:cursor-not-allowed disabled:opacity-35";

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3"
      aria-label="Table pagination"
    >
      <div className="text-[11px] font-medium text-gray-500">
        {total ? (
          <>Showing <strong className="text-gray-700">{firstRecord}–{lastRecord}</strong> of <strong className="text-gray-700">{total}</strong></>
        ) : (
          "No records"
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {onPageSizeChange && (
          <div className="pagination-page-size mr-2 flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-[#eee8da] bg-[#fffaf0] px-2.5 text-[10px] font-medium text-gray-500">
            <span className="hidden sm:inline">Rows per page</span>
            <span className="sm:hidden">Rows</span>
            <ThemedSelect
              value={pageSize}
              ariaLabel="Rows per page"
              disabled={loading}
              onChange={(size) => onPageSizeChange(Number(size))}
              options={[10, 20, 50, 100].map((size) => ({ value: size, label: String(size) }))}
              className="w-[58px] border-0 bg-transparent px-1.5 font-semibold text-[#211b62] focus:ring-0"
              menuClassName="min-w-[76px]"
              menuPlacement="top"
            />
          </div>
        )}
        <button type="button" className={`${navButton} hidden sm:inline-flex`} disabled={safePage === 1 || loading} onClick={() => goTo(1)} aria-label="First page">
          <ChevronFirst size={15} />
        </button>
        <button type="button" className={navButton} disabled={safePage === 1 || loading} onClick={() => goTo(safePage - 1)} aria-label="Previous page">
          <ChevronLeft size={15} />
        </button>

        <div className="hidden items-center gap-1.5 sm:flex">
          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => goTo(pageNumber)}
              disabled={loading}
              aria-current={pageNumber === safePage ? "page" : undefined}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[11px] font-semibold transition ${
                pageNumber === safePage
                  ? "bg-[#211b62] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-[#dca719]/50 hover:bg-[#fffaf0]"
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <span className="px-2 text-[11px] font-semibold text-gray-600 sm:hidden">
          {safePage} / {safeTotalPages}
        </span>

        <button type="button" className={navButton} disabled={safePage === safeTotalPages || loading} onClick={() => goTo(safePage + 1)} aria-label="Next page">
          <ChevronRight size={15} />
        </button>
        <button type="button" className={`${navButton} hidden sm:inline-flex`} disabled={safePage === safeTotalPages || loading} onClick={() => goTo(safeTotalPages)} aria-label="Last page">
          <ChevronLast size={15} />
        </button>
      </div>
    </nav>
  );
}
