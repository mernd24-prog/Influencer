import {
  Filter,
  Search,
} from "lucide-react";

import {
  RESOURCE_STATUS_OPTIONS,
} from "../data/appData";

import {
  formatLabel,
} from "../utils/helper";
import ThemedSelect from "./ThemedSelect";
import DateRangeFilter from "./DateRangeFilter";

export default function ResourceFilters({
  type,
  search,
  setSearch,
  status,
  setStatus,
  scope,
  setScope,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  setPage,
  showScope = false,
  showDates = true,
}) {
  const activeFilterCount =
    Number(Boolean(status)) +
    Number(showScope && scope && scope !== "all") +
    Number(Boolean(fromDate || toDate));

  const clearFilters = () => {
    setPage(1);
    if (setStatus) setStatus("");
    if (setScope) setScope("all");
    if (setFromDate) setFromDate("");
    if (setToDate) setToDate("");
  };

  return (
    <div className="border-b border-gray-100 bg-white">
      {/* =========================
          Search Row
      ========================== */}

      <div className="flex items-center px-4 py-3">
        <div className="flex h-10 w-full max-w-[580px] items-center gap-2 rounded-md border border-[#eadfce] bg-white px-3 transition focus-within:border-[#dca719] focus-within:ring-2 focus-within:ring-[#dca719]/10">
          <Search
            size={16}
            className="shrink-0 text-gray-400"
          />

          <input
            value={search}
            onChange={(event) => {
              setPage(1);

              setSearch(
                event.target.value
              );
            }}
            placeholder="Search"
            className="w-full border-0 bg-transparent text-[12px] text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* =========================
          Filters Section
      ========================== */}

      {(showScope ||
        RESOURCE_STATUS_OPTIONS[
          type
        ] ||
        showDates) && (
        <div className="border-t border-gray-100 bg-[#fffdf8] px-4 py-3">
          {/* Filter Heading */}

          <div className="mb-2.5 flex items-center gap-2">
            <Filter
              size={14}
              className="text-gray-500"
            />

            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Filters
            </span>

            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#dca719] px-1.5 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="resource-filter-clear ml-auto inline-flex h-7 items-center rounded-md border border-red-100 bg-white px-3 font-semibold text-red-500 transition hover:bg-red-50"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Filter Fields */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Scope */}

            {showScope && (
              <FilterField label="Scope">
                <ThemedSelect
                  value={scope}
                  ariaLabel="Order scope"
                  onChange={(value) => {
                    setPage(1);
                    setScope(value);
                  }}
                  options={[
                    { value: "all", label: "All referred orders" },
                    { value: "own", label: "My codes only" },
                    { value: "children", label: "Associate codes only" },
                  ]}
                />
              </FilterField>
            )}

            {/* Status */}

            {RESOURCE_STATUS_OPTIONS[
              type
            ] && (
              <FilterField label="Status">
                <ThemedSelect
                  value={status}
                  ariaLabel="Status"
                  onChange={(value) => {
                    setPage(1);
                    setStatus(value);
                  }}
                  options={[
                    { value: "", label: "All statuses" },
                    ...RESOURCE_STATUS_OPTIONS[type].map((item) => ({ value: item, label: formatLabel(item) })),
                  ]}
                />
              </FilterField>
            )}

            {showDates && (
              <FilterField label="Date Range">
                <DateRangeFilter
                  fromDate={fromDate}
                  toDate={toDate}
                  onApply={(from, to) => {
                    setPage(1);
                    setFromDate(from);
                    setToDate(to);
                  }}
                />
              </FilterField>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterField({
  label,
  children,
}) {
  return (
    <div className="grid min-w-0 gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>

      {children}
    </div>
  );
}
