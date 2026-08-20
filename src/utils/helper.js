export const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const formatMoney = (value) =>
  `₹${formatNumber(value)}`;

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const formatLabel = (value) =>
  String(value || "—")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const rowsFrom = (data) =>
  Array.isArray(data)
    ? data
    : data?.items || data?.children || [];

export const getNestedValue = (row, key) =>
  key
    .split(".")
    .reduce((value, part) => value?.[part], row);

export const copyText = async (value) => {
  const text = String(value ?? "");

  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  const input = document.createElement("textarea");

  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";

  document.body.appendChild(input);
  input.select();

  document.execCommand("copy");
  input.remove();
};

export const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();

  const common =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize";

  if (
    [
      "active",
      "completed",
      "available",
      "paid",
      "achieved",
    ].includes(value)
  ) {
    return `${common} bg-emerald-50 text-emerald-700`;
  }

  if (
    [
      "pending",
      "locked",
      "in_progress",
      "payout_requested",
    ].includes(value)
  ) {
    return `${common} bg-amber-50 text-amber-700`;
  }

  if (
    [
      "cancelled",
      "rejected",
      "expired",
      "suspended",
      "reversed",
    ].includes(value)
  ) {
    return `${common} bg-red-50 text-red-600`;
  }

  return `${common} bg-gray-100 text-gray-600`;
};

export const formatValue = (value, kind) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (kind === "date") {
    return formatDate(value);
  }

  if (kind === "amount") {
    return formatMoney(value);
  }

  if (kind === "number") {
    return formatNumber(value);
  }

  return typeof value === "object"
    ? "Available"
    : String(value);
};