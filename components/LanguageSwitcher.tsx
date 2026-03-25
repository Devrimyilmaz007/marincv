"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";

/* ── Locale Config ──────────────────────────────────────────────────────── */
const LOCALES = [
  { code: "tr", label: "Türkçe", short: "TR", flag: "🇹🇷" },
  { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function LanguageSwitcher({ currentLocale }: { currentLocale: LocaleCode }) {
  const router                       = useRouter();
  const [open,       setOpen]        = useState(false);
  const [active,     setActive]      = useState<LocaleCode>(currentLocale);
  const [isPending,  startTransition] = useTransition();
  const containerRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => { setActive(currentLocale); }, [currentLocale]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  function select(code: LocaleCode) {
    if (code === active || isPending) return;
    setOpen(false);
    setActive(code); // optimistic

    startTransition(async () => {
      // 1. Set cookie on the server
      await setLocale(code);
      // 2. Force server components (including layout) to re-render
      //    with the now-updated cookie
      router.refresh();
    });
  }

  const activeLocale = LOCALES.find((l) => l.code === active)!;

  return (
    <div ref={containerRef} className="relative">

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Dil seçin"
        disabled={isPending}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-150 cursor-pointer select-none disabled:opacity-60 disabled:cursor-wait"
      >
        {isPending ? (
          <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" aria-hidden />
        ) : (
          <span aria-hidden="true">{activeLocale.flag}</span>
        )}
        <span>{activeLocale.short}</span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Dil seçenekleri"
          className="absolute right-0 mt-2 w-44 bg-[#0B1221]/95 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50"
        >
          {LOCALES.map((locale) => {
            const isActive = locale.code === active;
            return (
              <button
                key={locale.code}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => select(locale.code)}
                className={[
                  "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 cursor-pointer",
                  isActive
                    ? "text-[#00D2FF] bg-[#00D2FF]/8 font-semibold"
                    : "text-slate-300 hover:text-[#00D2FF] hover:bg-slate-800/80",
                ].join(" ")}
              >
                <span className="text-base leading-none" aria-hidden="true">{locale.flag}</span>
                <span className="flex-1 text-left">{locale.label}</span>
                {isActive && (
                  <svg className="w-3.5 h-3.5 text-[#00D2FF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
