import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export default function ThemedSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
  menuClassName = "",
  menuPlacement = "bottom",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!buttonRef.current?.contains(event.target)) setOpen(false);
    };
    const handleScroll = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const reposition = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition(menuPlacement === "top"
        ? {
            left: rect.left,
            bottom: window.innerHeight - rect.top + 5,
            width: rect.width,
          }
        : { left: rect.left, top: rect.bottom + 5, width: rect.width });
    }
    setOpen((current) => !current);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        disabled={disabled}
        className={`themed-select-trigger flex h-9 w-full items-center justify-between gap-2 rounded-md border border-[#e2d8c5] bg-white px-3 text-left font-medium text-gray-600 outline-none transition hover:border-[#d4bc86] focus:border-[#dca719] focus:ring-2 focus:ring-[#dca719]/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? "rotate-180 text-[#dca719]" : "text-gray-400"}`} />
      </button>

      {open && position && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={ariaLabel}
          onMouseDown={(event) => event.stopPropagation()}
          className={`themed-select-menu fixed z-[1000] max-h-56 overflow-y-auto rounded-md border border-[#d9d3c8] bg-white py-1 shadow-[0_10px_24px_rgba(31,27,95,0.14)] ${menuClassName}`}
          style={position}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={active}
                disabled={option.disabled}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[9px] font-medium transition ${
                  active
                    ? "bg-[#edf2ff] text-[#211b62]"
                    : "text-gray-600 hover:bg-[#fff8e9] hover:text-[#211b62]"
                } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`}
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
