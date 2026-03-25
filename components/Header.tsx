"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Anchor } from "lucide-react";

/* ── Language Switcher ──────────────────────────────────────────────────── */
const languages = [
  { code: "tr", label: "TR", flag: "🇹🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
];

function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(languages[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Dil seçin"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
      >
        <span aria-hidden="true">{active.flag}</span>
        <span>{active.label}</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Dil seçenekleri"
          className="absolute right-0 mt-1.5 w-28 bg-[#0B1221]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
        >
          {languages.map((lang) => (
            <li key={lang.code} role="option" aria-selected={lang.code === active.code}>
              <button
                onClick={() => {
                  setActive(lang);
                  setOpen(false);
                }}
                className={[
                  "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors duration-150 cursor-pointer",
                  lang.code === active.code
                    ? "text-[#00D2FF] font-semibold bg-[#00D2FF]/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span aria-hidden="true">{lang.flag}</span>
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Navigation Links ───────────────────────────────────────────────────── */
const navLinks = [
  { href: "/candidates", label: "Adaylar"    },
  { href: "/employers",  label: "İşverenler" },
  { href: "/jobs",       label: "İlanlar"    },
];

/* ── Navigation Header ──────────────────────────────────────────────────── */
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-[#050B14]/90 backdrop-blur-md border-b border-white/8">
      <div className="flex items-center justify-between px-5 md:px-8 py-4 max-w-7xl mx-auto w-full">

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex-shrink-0 flex items-center gap-2 font-extrabold text-xl tracking-tight select-none focus-visible:outline-none"
          aria-label="MarinCV Ana Sayfa"
        >
          <Anchor size={20} className="text-[#00D2FF]" aria-hidden="true" />
          <span className="text-white">Marin</span>
          <span className="text-[#00D2FF]">CV</span>
        </Link>

        {/* ── Desktop Navigation ───────────────────────────────────── */}
        <nav
          aria-label="Ana Navigasyon"
          className="hidden md:flex items-center gap-8 font-medium"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop Actions ──────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="border border-white/15 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:border-white/30 hover:text-white transition-all duration-150"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="bg-[#00D2FF] text-[#050B14] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00BBE0] transition-colors duration-150"
          >
            Kayıt Ol
          </Link>
        </div>

        {/* ── Mobile Right Side ────────────────────────────────────── */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ─────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden animate-slide-down">
          <div className="mx-4 mb-4 rounded-2xl bg-[#0B1221]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">

            {/* Nav Links */}
            <nav aria-label="Mobil Navigasyon" className="flex flex-col p-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="mx-4 border-t border-white/8" />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 p-4">
              <Link
                href="/login"
                onClick={closeMenu}
                className="w-full flex items-center justify-center border border-white/15 text-slate-300 px-5 py-3 rounded-xl text-sm font-semibold hover:border-white/30 hover:text-white transition-all duration-150"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                onClick={closeMenu}
                className="w-full flex items-center justify-center bg-[#00D2FF] text-[#050B14] px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#00BBE0] transition-colors duration-150"
              >
                Kayıt Ol — Ücretsiz
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
