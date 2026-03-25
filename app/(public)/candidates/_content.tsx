"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Locale } from "@/lib/dictionaries";
import trDict from "@/dictionaries/tr.json";
import enDict from "@/dictionaries/en.json";
import { SHIP_TYPES, RANK_PRESETS, typeGradient } from "@/lib/vessel-data";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface SeaService {
  grt:       number | null;
  ship_type: string;
  sign_on_date:  string;
  sign_off_date: string | null;
}

interface Certificate {
  name:        string;
  expiry_date: string | null;
}

interface CandidateProfile {
  id:             string;
  full_name:      string;
  nationality:    string | null;
  sea_service:    SeaService[];
  certificates:   Certificate[];
}

/* ── Presets (Turkish keys match DB values) ──────────────────────────────── */
const SHIP_TYPE_KEYS = [...SHIP_TYPES];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function maskName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Denizci";
  if (parts.length === 1) return parts[0][0].toUpperCase() + ".";
  return parts[0][0].toUpperCase() + ". " + parts[parts.length - 1][0].toUpperCase() + ".";
}

function totalServiceMonths(services: SeaService[]): number {
  return services.reduce((acc, s) => {
    const on  = new Date(s.sign_on_date).getTime();
    const off = s.sign_off_date ? new Date(s.sign_off_date).getTime() : Date.now();
    return acc + Math.max(0, (off - on) / (1000 * 60 * 60 * 24 * 30.44));
  }, 0);
}

function fmtDuration(months: number): string {
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  if (y === 0 && m === 0) return "< 1 ay";
  if (y === 0) return `${m} ay`;
  if (m === 0) return `${y} yıl`;
  return `${y} yıl ${m} ay`;
}

function topShipTypes(services: SeaService[]): string[] {
  const counts: Record<string, number> = {};
  services.forEach((s) => { counts[s.ship_type] = (counts[s.ship_type] ?? 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);
}

function highestGrt(services: SeaService[]): number {
  return services.reduce((max, s) => Math.max(max, s.grt ?? 0), 0);
}

function stcwStatus(certs: Certificate[]): "full" | "partial" | "none" {
  const now = new Date();
  const valid = certs.filter((c) => !c.expiry_date || new Date(c.expiry_date) > now);
  if (valid.length === 0) return "none";
  const hasCore = valid.some((c) => c.name.toLowerCase().includes("stcw"));
  return hasCore ? "full" : "partial";
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Sk({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-slate-700/50 ${className ?? ""}`} aria-hidden />;
}
function CardSkeleton() {
  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-700/60 shrink-0" />
        <div className="flex-1"><Sk className="h-4 w-28 mb-2" /><Sk className="h-3 w-20" /></div>
        <Sk className="h-6 w-16 rounded-lg" />
      </div>
      <div className="h-px bg-slate-800" />
      <div className="flex gap-2"><Sk className="h-6 w-24 rounded-lg" /><Sk className="h-6 w-20 rounded-lg" /></div>
      <Sk className="h-10 rounded-xl" />
    </div>
  );
}

/* ── Candidate Card ──────────────────────────────────────────────────────── */
function CandidateCard({ candidate, t, shipTypeMap }: {
  candidate: CandidateProfile;
  t: typeof trDict.candidates_page;
  shipTypeMap: Record<string, string>;
}) {
  const months   = totalServiceMonths(candidate.sea_service);
  const types    = topShipTypes(candidate.sea_service);
  const grt      = highestGrt(candidate.sea_service);
  const stcw     = stcwStatus(candidate.certificates);
  const masked   = maskName(candidate.full_name);

  const stcwBadge = {
    full:    { label: t.stcw_full,    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
    partial: { label: t.stcw_partial, bg: "bg-amber-500/10   border-amber-500/20   text-amber-400"   },
    none:    { label: t.stcw_none,    bg: "bg-slate-700/40   border-slate-600/40   text-slate-400"   },
  }[stcw];

  return (
    <div className="bg-[#0B1221]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-[#00D2FF]/15 hover:shadow-lg hover:shadow-[#00D2FF]/5 transition-all duration-300">

      {/* Avatar + masked identity */}
      <div className="flex items-center gap-3">
        {/* Blurred / abstract avatar */}
        <div className="shrink-0 w-12 h-12 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800" />
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Masked name */}
          <p className="text-sm font-bold text-white">{masked}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {candidate.nationality ?? "Uyruk belirtilmemiş"}
          </p>
        </div>

        {/* STCW badge */}
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg border ${stcwBadge.bg}`}>
          {stcwBadge.label}
        </span>
      </div>

      <div className="h-px bg-white/5" />

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 text-xs">
        {months > 0 && (
          <div className="flex items-center gap-1.5 text-slate-300">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-semibold text-white">{fmtDuration(months)}</span>
            <span className="text-slate-500">{t.sea_service}</span>
          </div>
        )}
        {grt > 0 && (
          <div className="flex items-center gap-1.5 text-slate-300">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-9.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v16.5c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V3.375zm-9.75 9.75" /></svg>
            <span className="font-semibold text-white">{grt.toLocaleString("tr-TR")}</span>
            <span className="text-slate-500">GRT</span>
          </div>
        )}
      </div>

      {/* Ship type badges */}
      {types.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {types.map((type) => (
            <span key={type} className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${typeGradient(type)}`}>
              {shipTypeMap[type] ?? type}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <Link
        href="/register"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        {t.profile_button}
      </Link>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function PublicCandidatesContent({ locale }: { locale: Locale }) {
  const d = locale === "en" ? enDict : trDict;
  const t = d.candidates_page;
  const shipTypeMap = d.ship_types as Record<string, string>;

  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterRank, setFilterRank] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("profiles")
        .select("id, full_name, nationality, sea_service(*), certificates(*)")
        .eq("role", "candidate")
        .order("id");

      if (err) setError(t.load_error);
      else     setCandidates((data ?? []) as unknown as CandidateProfile[]);
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (filterType && !c.sea_service.some((s) => s.ship_type === filterType)) return false;
      if (filterRank) return false; // rank is hidden for public, skip rank filter for now
      return true;
    });
  }, [candidates, filterType, filterRank]);

  const hasFilters = filterType !== "" || filterRank !== "";

  return (
    <div className="min-h-screen bg-[#050B14]">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] opacity-8 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D2FF] to-transparent blur-[90px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-20">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse" />
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">{t.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            {t.heading}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#00D2FF]/5 border border-[#00D2FF]/15 text-xs text-slate-400 mb-8 max-w-2xl mx-auto">
          <svg className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span>
            <strong className="text-slate-300">{t.privacy_notice}</strong> {t.privacy_text}
          </span>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
          <div className="relative flex-1">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all pr-9">
              <option value="">{t.all_vessel_types}</option>
              {SHIP_TYPE_KEYS.map((s) => <option key={s} value={s}>{shipTypeMap[s] ?? s}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          {hasFilters && (
            <button onClick={() => setFilterType("")}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all cursor-pointer shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              {t.reset}
            </button>
          )}
        </div>

        {/* Result count */}
        {!loading && !error && (
          <p className="text-xs text-slate-500 mb-5 text-center">
            <span className="text-[#00D2FF] font-semibold">{filtered.length}</span> {t.match_count}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">{t.empty_heading}</h3>
            <p className="text-sm text-slate-400">{t.empty_sub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => <CandidateCard key={c.id} candidate={c} t={t} shipTypeMap={shipTypeMap} />)}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && filtered.length > 0 && (
          <div className="mt-14 p-8 rounded-2xl bg-gradient-to-br from-[#0B2447]/60 to-[#050B14] border border-white/10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#00D2FF]/10 border border-[#00D2FF]/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#00D2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t.cta_heading}</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              {t.cta_subtitle}
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#00D2FF] text-[#050B14] text-sm font-bold hover:bg-white transition-all duration-200 shadow-lg shadow-[#00D2FF]/20">
              {t.cta_button}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
