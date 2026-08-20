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
        <div className="border-t border-gray-100 bg-[#fffdf8] px-4 py-4">
          {/* Filter Heading */}

          <div className="mb-4 flex items-center gap-2">
            <Filter
              size={14}
              className="text-gray-500"
            />

            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Filters
            </span>
          </div>

          {/* Filter Fields */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Scope */}

            {showScope && (
              <FilterField label="Scope">
                <select
                  value={scope}
                  onChange={(event) => {
                    setPage(1);

                    setScope(
                      event.target
                        .value
                    );
                  }}
                  className={selectClass}
                >
                  <option value="all">
                    All referred orders
                  </option>

                  <option value="own">
                    My codes only
                  </option>

                  <option value="children">
                    Associate codes only
                  </option>
                </select>
              </FilterField>
            )}

            {/* Status */}

            {RESOURCE_STATUS_OPTIONS[
              type
            ] && (
              <FilterField label="Status">
                <select
                  value={status}
                  onChange={(event) => {
                    setPage(1);

                    setStatus(
                      event.target
                        .value
                    );
                  }}
                  className={selectClass}
                >
                  <option value="">
                    All statuses
                  </option>

                  {RESOURCE_STATUS_OPTIONS[
                    type
                  ].map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {formatLabel(
                          item
                        )}
                      </option>
                    )
                  )}
                </select>
              </FilterField>
            )}

            {/* From Date */}

            {showDates && (
              <FilterField label="From">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(
                    event
                  ) => {
                    setPage(1);

                    setFromDate(
                      event.target
                        .value
                    );
                  }}
                  className={dateInputClass}
                />
              </FilterField>
            )}

            {/* To Date */}

            {showDates && (
              <FilterField label="To">
                <input
                  type="date"
                  value={toDate}
                  onChange={(
                    event
                  ) => {
                    setPage(1);

                    setToDate(
                      event.target
                        .value
                    );
                  }}
                  className={dateInputClass}
                />
              </FilterField>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const selectClass =
  "h-10 w-full rounded-md border border-[#eadfce] bg-white px-3 text-[12px] font-medium text-gray-600 outline-none transition hover:border-gray-300 focus:border-[#dca719] focus:ring-2 focus:ring-[#dca719]/10";

const dateInputClass =
  "h-10 w-full rounded-md border border-[#eadfce] bg-white px-3 text-[10px] font-medium text-gray-600 outline-none transition hover:border-gray-300 focus:border-[#dca719] focus:ring-2 focus:ring-[#dca719]/10";
function FilterField({
  label,
  children,
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>

      {children}
    </label>
  );
}