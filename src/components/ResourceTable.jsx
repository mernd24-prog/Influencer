import { useRef } from "react";
import { Eye } from "lucide-react";

import {
  formatLabel,
  formatValue,
  getNestedValue,
  getStatusClass,
} from "../utils/helper";
import NoDataState from "./NoDataState";
import { TableSkeleton } from "./Skeleton";
import Pagination from "./Pagination";

export default function ResourceTable({
  columns,
  rows,
  pageTitle,
  pagination = {},
  page,
  setPage,
  pageSize,
  setPageSize,
  loading,
  error,
  onRetry,
  onView,
}) {
  const hasLoadedRef = useRef(false);

  if (!loading) {
    hasLoadedRef.current = true;
  }

  const initialLoading = loading && !hasLoadedRef.current;
  const refreshing = loading && hasLoadedRef.current;

  return (
    <>
      {error ? (
        /* Error State */
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 p-6">
          <p className="text-[12px] font-medium text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-600 transition hover:border-[#dca719]/50 hover:bg-[#fffaf0] hover:text-[#211b62]"
          >
            Try again
          </button>
        </div>
      ) : initialLoading ? (
        /* Loading State */
        <TableSkeleton />
      ) : (
        /* Table */
        <div className="relative">
          {refreshing && (
            <div
              className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-[#f8edcf]"
              role="progressbar"
              aria-label="Refreshing results"
            >
              <div className="h-full w-1/3 animate-pulse rounded-full bg-[#dca719]" />
            </div>
          )}

          <div className={`overflow-x-auto transition-opacity duration-150 ${refreshing ? "opacity-70" : "opacity-100"}`}>
            <table className="w-full whitespace-nowrap border-collapse">
            <thead>
              <tr>
                {columns.map(([key, label]) => (
                  <th
                    key={key}
                    className="bg-[#fafbfe] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {label}
                  </th>
                ))}

                {onView && (
                  <th className="bg-[#fafbfe] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Details
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {rows.length ? (
                rows.map((row, index) => (
                  <tr
                    key={
                      row.orderId ||
                      row.code ||
                      row.id ||
                      index
                    }
                    className="border-t border-gray-100 transition-colors hover:bg-gray-50/70"
                  >
                    {columns.map(
                      ([key, , kind]) => {
                        const value =
                          getNestedValue(
                            row,
                            key
                          );

                        return (
                          <td
                            key={key}
                            className="max-w-[230px] overflow-hidden text-ellipsis px-4 py-3 text-[12px] font-medium text-gray-600"
                            title={
                              typeof value ===
                                "string" ||
                              typeof value ===
                                "number"
                                ? String(value)
                                : undefined
                            }
                          >
                            {kind ===
                            "status" ? (
                              <span
                                className={getStatusClass(
                                  value
                                )}
                              >
                                {formatLabel(
                                  value
                                )}
                              </span>
                            ) : (
                              formatValue(
                                value,
                                kind
                              )
                            )}
                          </td>
                        );
                      }
                    )}

                    {onView && (
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            onView(row)
                          }
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-[11px] font-medium text-[#211b62] transition hover:border-[#211b62]/20 hover:bg-[#f5f3ff]"
                        >
                          <Eye
                            size={14}
                            strokeWidth={
                              1.9
                            }
                          />

                          View
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                /* Empty State */
           <tr>
  <td
    colSpan={
      columns.length +
      (onView ? 1 : 0)
    }
    className="p-0"
  >
    <NoDataState
      message={`No ${pageTitle.toLowerCase()} found`}
      className="min-h-[200px]"
    />
  </td>
</tr>
              )}
            </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={pagination.page || page}
        totalPages={pagination.totalPages || 1}
        total={pagination.total ?? rows.length}
        pageSize={pageSize || pagination.limit || pagination.pageSize || 20}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={setPageSize ? (size) => {
          setPage(1);
          setPageSize(size);
        } : undefined}
      />
    </>
  );
}
