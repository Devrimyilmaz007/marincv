"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface NavDict {
  candidates: string;
  employers: string;
  jobs: string;
  login: string;
  register: string;
}

interface Props {
  dict: NavDict;
  locale: "tr" | "en";
}

const navLinks = [
  { href: "/candidates", key: "candidates" as const },
  { href: "/employers",  key: "employers"  as const },
  { href: "/jobs",       key: "jobs"        as const },
];

export default function PublicHeader({ dict, locale }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#050B14]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-5 md:px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          onClick={close}
          className="text-2xl font-black tracking-tighter text-white select-none"
          aria-label="MarinCV Ana Sayfa"
        >
          Marin<span className="text-[#00D2FF]">CV</span>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden md:flex gap-8 text-sm font-medium text-slate-400"
          aria-label="Ana Navigasyon"
        >
          {navLinks.map(({ href, key }) => (
            <Link key={href} href={href} className="hover:text-white transition-colors">
              {dict[key]}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <div className="w-px h-5 bg-slate-700/60 mx-1" aria-hidden="true" />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-2 py-2"
          >
            {dict.login}
          </Link>
          <Link
            href="/register"
            className="text-sm font-bold bg-[#00D2FF] text-[#050B14] px-5 py-2.5 rounded-lg hover:bg-[#00BBE0] transition-all whitespace-nowrap"
          >
            {dict.register}
          </Link>
        </div>

        {/* Mobile Right Side */}
        <div className="flex md:hidden items-center gap-1">
          <LanguageSwitcher currentLocale={locale} />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden animate-slide-down">
          <div className="mx-4 mb-4 rounded-2xl bg-[#0B1221]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">

            {/* Nav Links */}
            <nav className="flex flex-col p-3" aria-label="Mobil Navigasyon">
              {navLinks.map(({ href, key }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
                >
                  {dict[key]}
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="mx-4 border-t border-white/8" />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 p-4">
              <Link
                href="/login"
                onClick={close}
                className="w-full flex items-center justify-center border border-white/15 text-slate-300 px-5 py-3 rounded-xl text-sm font-semibold hover:border-white/30 hover:text-white transition-all duration-150"
              >
                {dict.login}
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="w-full flex items-center justify-center bg-[#00D2FF] text-[#050B14] px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#00BBE0] transition-colors duration-150"
              >
                {dict.register} — Ücretsiz
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
