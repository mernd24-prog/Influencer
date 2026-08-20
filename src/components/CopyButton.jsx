import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "../utils/helper";

export default function CopyButton({
  value,
  label = "value",
  variant = "light",
  className = "",
}) {
  const [result, setResult] = useState("");
  const timerRef = useRef();

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = async () => {
    const copied = await copyText(value);
    setResult(copied ? "copied" : "failed");
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setResult(""), 1800);
  };

  const dark = variant === "dark";

 return (
  <button
    type="button"
    title={`Copy ${label}`}
    aria-label={result === "copied" ? `${label} copied` : `Copy ${label}`}
    onClick={copy}
    className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition ${
      dark
        ? "text-white hover:bg-white/10"
        : "border border-gray-200 bg-white text-[#211b62] hover:border-[#dca719]/40 hover:bg-[#fffaf0]"
    } ${
      result === "copied" ? "!border-[#dca719]/50 !bg-[#fffaf0] !text-[#dca719]" : ""
    } ${className}`}
  >
    {result === "copied" ? (
      <Check size={14} />
    ) : (
      <Copy size={13} />
    )}

    {result && (
      <span
        role="status"
        className={`pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold text-white shadow-lg ${
          result === "copied"
            ? "bg-[#211b62]"
            : "bg-red-500"
        }`}
      >
        {result === "copied" ? "Copied" : "Copy failed"}
      </span>
    )}
  </button>
);
  
}
