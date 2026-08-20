import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import ThemedSelect from "./ThemedSelect";

const toIso = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = toIso(new Date());
const now = new Date();
const currentYear = now.getFullYear();
const currentMonthIndex = now.getMonth();
const monthOptions = Array.from({ length: 12 }, (_, value) => ({
  value,
  label: new Date(2000, value, 1).toLocaleDateString("en-IN", { month: "long" }),
}));
const yearOptions = Array.from({ length: 21 }, (_, index) => ({
  value: currentYear - index,
  label: String(currentYear - index),
}));

const calendarDays = (month) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

const displayDate = (value) => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  : "";

export default function DateRangeFilter({
  fromDate,
  toDate,
  onApply,
}) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(fromDate);
  const [draftTo, setDraftTo] = useState(toDate);
  const [month, setMonth] = useState(() => new Date());

  useEffect(() => {
    if (open) {
      setDraftFrom(fromDate);
      setDraftTo(toDate);
      const initial = fromDate ? new Date(`${fromDate}T00:00:00`) : new Date();
      setMonth(new Date(initial.getFullYear(), initial.getMonth(), 1));
    }
  }, [open, fromDate, toDate]);

  const label = fromDate || toDate
    ? `${displayDate(fromDate) || "Start"} – ${displayDate(toDate) || "End"}`
    : "All date ranges";

  const apply = () => {
    if (!draftFrom || !draftTo) return;
    flushSync(() => setOpen(false));
    onApply(draftFrom, draftTo);
  };

  const chooseDate = (date) => {
    const value = toIso(date);
    if (!draftFrom || draftTo) {
      setDraftFrom(value);
      setDraftTo("");
    } else if (value < draftFrom) {
      setDraftFrom(value);
      setDraftTo("");
    } else {
      setDraftTo(value);
    }
  };

  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  const canGoNext = month < currentMonth;

  const changeMonth = (monthIndex) => {
    setMonth(new Date(month.getFullYear(), Number(monthIndex), 1));
  };

  const changeYear = (year) => {
    const nextYear = Number(year);
    const nextMonth = nextYear === currentYear
      ? Math.min(month.getMonth(), currentMonthIndex)
      : month.getMonth();
    setMonth(new Date(nextYear, nextMonth, 1));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="themed-select-trigger flex h-9 w-full items-center justify-between gap-2 rounded-md border border-[#e2d8c5] bg-white px-3 text-left font-medium text-gray-600 transition hover:border-[#d4bc86] focus:border-[#dca719] focus:outline-none focus:ring-2 focus:ring-[#dca719]/10"
      >
        <span className="truncate">{label}</span>
        <CalendarDays size={14} className="shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[1px]" onMouseDown={() => setOpen(false)}>
          <div className="date-range-dialog w-full max-w-[390px] overflow-hidden rounded-xl border border-[#dca719] bg-white shadow-[0_24px_70px_rgba(31,27,95,0.24)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-[15px] font-semibold text-[#211b62]">Select Date Range</h3>
               
              </div>
              <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close date range">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 pb-3">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eadfce] text-[#a97908] hover:bg-[#fff8e9]"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={15} />
                </button>

                <div className="flex items-center gap-2">
                  <ThemedSelect
                    value={month.getMonth()}
                    ariaLabel="Select month"
                    onChange={changeMonth}
                    options={monthOptions.map((option) => ({
                      ...option,
                      disabled: month.getFullYear() === currentYear && option.value > currentMonthIndex,
                    }))}
                    className="w-[112px] px-2 text-[10px]"
                    menuClassName="max-h-48"
                  />
                  <ThemedSelect
                    value={month.getFullYear()}
                    ariaLabel="Select year"
                    onChange={changeYear}
                    options={yearOptions}
                    className="w-[82px] px-2 text-[10px]"
                    menuClassName="max-h-48"
                  />
                </div>

                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eadfce] text-[#a97908] hover:bg-[#fff8e9] disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Next month"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <p className="mb-3 text-center text-[10px] text-gray-400">
                {!draftFrom || draftTo ? "Select start date" : "Select end date"}
              </p>

              <div className="grid grid-cols-7 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <span key={day} className="py-2 text-[9px] font-semibold uppercase text-gray-400">{day}</span>
                ))}

                {calendarDays(month).map((date) => {
                  const value = toIso(date);
                  const outsideMonth = date.getMonth() !== month.getMonth();
                  const future = value > today;
                  const endpoint = value === draftFrom || value === draftTo;
                  const inRange = draftFrom && draftTo && value > draftFrom && value < draftTo;

                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={outsideMonth || future}
                      onClick={() => chooseDate(date)}
                      className={`mx-auto my-0.5 flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-semibold transition ${
                        endpoint
                          ? "bg-[#211b62] text-white shadow-sm"
                          : inRange
                            ? "bg-[#fff2cd] text-[#8a6508]"
                            : "text-gray-700 hover:bg-[#fff8e9] hover:text-[#211b62]"
                      } disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mx-5 rounded-lg border border-[#eadfce] bg-[#fffaf0] px-3 py-2 text-[10px] font-medium text-[#9a7009]">
              {draftFrom || draftTo
                ? `${displayDate(draftFrom) || "Start date"} – ${displayDate(draftTo) || "End date"}`
                : "Select a start and end date"}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-5 py-4">
              <div className="flex gap-2">
                <button type="button" onClick={() => { setDraftFrom(today); setDraftTo(today); }} className="h-8 rounded-md border border-[#dca719] px-3 text-[10px] font-semibold text-[#a97908] hover:bg-[#fff8e9]">Today</button>
                <button type="button" onClick={() => { onApply("", ""); setOpen(false); }} className="h-8 rounded-md border border-red-100 px-3 text-[10px] font-semibold text-red-500 hover:bg-red-50">Clear</button>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="h-8 rounded-md border border-gray-200 px-3 text-[10px] font-semibold text-gray-500 hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={apply} disabled={!draftFrom || !draftTo} className="h-8 rounded-md bg-[#dca719] px-4 text-[10px] font-semibold text-white hover:bg-[#c79715] disabled:cursor-not-allowed disabled:opacity-50">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
