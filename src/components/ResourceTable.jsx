import { Eye } from "lucide-react";

import {
  formatLabel,
  formatValue,
  getNestedValue,
  getStatusClass,
} from "../utils/helper";
import NoDataState from "./NoDataState";

export default function ResourceTable({
  columns,
  rows,
  pageTitle,
  pagination = {},
  page,
  setPage,
  loading,
  error,
  onRetry,
  onView,
}) {
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
      ) : loading ? (
        /* Loading State */
        <LoadingTable />
      ) : (
        /* Table */
        <div className="overflow-x-auto">
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
      )}

      {/* Pagination */}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3">
        <span className="text-[11px] font-medium text-gray-500">
          Page{" "}
          {pagination.page || page}{" "}
          of{" "}
          {pagination.totalPages || 1}
          {" · "}
          {pagination.total ||
            rows.length}{" "}
          records
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={
              page <= 1 || loading
            }
            onClick={() =>
              setPage(
                (value) => value - 1
              )
            }
            className="inline-flex h-8 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-[11px] font-medium text-gray-600 transition hover:border-[#dca719]/50 hover:bg-[#fffaf0] hover:text-[#211b62] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={
              page >=
                (pagination.totalPages ||
                  1) ||
              loading
            }
            onClick={() =>
              setPage(
                (value) => value + 1
              )
            }
            className="inline-flex h-8 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-[11px] font-medium text-gray-600 transition hover:border-[#dca719]/50 hover:bg-[#fffaf0] hover:text-[#211b62] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

function LoadingTable() {
  return (
    <div className="grid gap-3 p-5">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="h-10 animate-pulse rounded-md bg-gray-100"
          />
        )
      )}
    </div>
  );
}