"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useDashUser } from "../_context";
import { SHIP_TYPES, RANK_PRESETS, typeGradient } from "@/lib/vessel-data";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface SeaService {
  id:            string;
  ship_name:     string;
  ship_type:     string;
  grt:           number | null;
  rank:          string;
  sign_on_date:  string;
  sign_off_date: string | null;
}

interface Certificate {
  id:          string;
  name:        string;
  issue_date:  string;
  expiry_date: string | null;
}

interface CandidateProfile {
  id:             string;
  full_name:      string;
  nationality:    string;
  city:           string;
  seaman_book_no: string | null;
  sea_service:    SeaService[];
  certificates:   Certificate[];
}

interface Filters {
  search:  string;
  rank:    string;
  type:    string;
  minGrt:  string;
}

const EMPTY_FILTERS: Filters = { search: "", rank: "", type: "", minGrt: "" };


/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function daysBetween(from: string, to: string | null): number {
  return Math.max(0, Math.floor((((to ? new Date(to) : new Date()).getTime()) - new Date(from).getTime()) / 86_400_000));
}

function formatDuration(totalDays: number): string {
  const y = Math.floor(totalDays / 365);
  const m = Math.floor((totalDays % 365) / 30);
  if (y === 0 && m === 0) return "< 1 Ay";
  if (y === 0) return `${m} Ay`;
  if (m === 0) return `${y} Yıl`;
  return `${y} Yıl ${m} Ay`;
}

function calcTotalService(ss: SeaService[]): string {
  return formatDuration(ss.reduce((acc, r) => acc + daysBetween(r.sign_on_date, r.sign_off_date), 0));
}

function highestGRT(ss: SeaService[]): number {
  return Math.max(0, ...ss.map((r) => r.grt ?? 0));
}

function topShipTypes(ss: SeaService[]): string[] {
  const counts: Record<string, number> = {};
  for (const r of ss) counts[r.ship_type] = (counts[r.ship_type] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
}

function latestRank(ss: SeaService[]): string {
  if (!ss.length) return "Belirtilmemiş";
  const sorted = [...ss].sort((a, b) =>
    new Date(b.sign_on_date).getTime() - new Date(a.sign_on_date).getTime()
  );
  return sorted[0].rank;
}

type CertStatus = "full" | "partial" | "none";

function certStatus(certs: Certificate[]): CertStatus {
  if (!certs.length) return "none";
  const today  = Date.now();
  const valid  = certs.filter((c) => !c.expiry_date || new Date(c.expiry_date).getTime() > today);
  const expired = certs.length - valid.length;
  if (expired === 0) return "full";
  if (valid.length > 0) return "partial";
  return "none";
}

/* ── Client-side filter ──────────────────────────────────────────────────── */
function applyFilters(candidates: CandidateProfile[], f: Filters): CandidateProfile[] {
  const search = f.search.trim().toLowerCase();
  const minGrt = f.minGrt ? parseInt(f.minGrt, 10) : 0;

  return candidates.filter((c) => {
    if (search) {
      const nameMatch    = c.full_name.toLowerCase().includes(search);
      const bookletMatch = (c.seaman_book_no ?? "").toLowerCase().includes(search);
      if (!nameMatch && !bookletMatch) return false;
    }
    if (f.rank) {
      const hasRank = c.sea_service.some((s) => s.rank.toLowerCase().includes(f.rank.toLowerCase()));
      if (!hasRank) return false;
    }
    if (f.type) {
      const hasType = c.sea_service.some((s) => s.ship_type === f.type);
      if (!hasType) return false;
    }
    if (minGrt > 0) {
      if (highestGRT(c.sea_service) < minGrt) return false;
    }
    return true;
  });
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-slate-700/50 ${className ?? ""}`} aria-hidden="true" />;
}

function CardSkeleton() {
  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-700/60 shrink-0" />
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-px w-full bg-slate-800 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-32 rounded-full mb-4" />
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  );
}

/* ── Cert Status indicator ───────────────────────────────────────────────── */
function CertBadge({ status }: { status: CertStatus }) {
  if (status === "full") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
        <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
        Belgeleri Tam
      </div>
    );
  }
  if (status === "partial") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
        <span className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </span>
        Bazı Belgeler Süresi Dolmuş
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
      <span className="w-4 h-4 rounded-full bg-slate-700 border border-slate-600/40 flex items-center justify-center shrink-0">
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
      Belge Girilmemiş
    </div>
  );
}

/* ── Candidate Card ──────────────────────────────────────────────────────── */
function CandidateCard({ candidate }: { candidate: CandidateProfile }) {
  const initials    = getInitials(candidate.full_name);
  const rank        = latestRank(candidate.sea_service);
  const totalSvc    = calcTotalService(candidate.sea_service);
  const maxGrt      = highestGRT(candidate.sea_service);
  const topTypes    = topShipTypes(candidate.sea_service);
  const cStatus     = certStatus(candidate.certificates);
  const hasService  = candidate.sea_service.length > 0;

  return (
    <div className="group relative bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 flex flex-col">

      {/* ── Top row ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-400 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{candidate.full_name}</p>
            <p className="text-xs text-slate-400 truncate">{rank}</p>
          </div>
        </div>

        {/* Total service pill */}
        {hasService && (
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 whitespace-nowrap">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {totalSvc}
          </div>
        )}
      </div>

      {/* ── Divider ─────────────────────────────────────────────────── */}
      <div className="h-px bg-slate-800 mb-4" />

      {/* ── Ship types ──────────────────────────────────────────────── */}
      <div className="flex-1 space-y-3">
        {topTypes.length > 0 ? (
          <div>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">Tecrübe</p>
            <div className="flex flex-wrap gap-1.5">
              {topTypes.map((t) => (
                <span key={t} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${typeGradient(t)} shadow-sm`}>
                  {t}
                </span>
              ))}
              {maxGrt > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-[#00D2FF]">
                  {maxGrt.toLocaleString("tr-TR")} GRT
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic">Henüz deniz hizmeti girilmemiş.</p>
        )}

        {/* ── Location ────────────────────────────────────────────── */}
        {(candidate.city || candidate.nationality) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {[candidate.city, candidate.nationality].filter(Boolean).join(", ")}
          </div>
        )}

        {/* ── STCW / Cert status ──────────────────────────────────── */}
        <CertBadge status={cStatus} />
      </div>

      {/* ── CTA Button ──────────────────────────────────────────────── */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <Link
          href={`/dashboard/candidates/${candidate.id}`}
          className="w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-700/60 text-slate-400 group-hover:border-violet-500/40 group-hover:text-violet-300 group-hover:bg-violet-500/10 transition-all duration-300 flex items-center justify-center gap-2"
        >
          Profili İncele
          <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

/* ── Filter Bar ──────────────────────────────────────────────────────────── */
function FilterBar({
  filters,
  onChange,
  onReset,
  resultCount,
  loading,
}: {
  filters:     Filters;
  onChange:    (f: Filters) => void;
  onReset:     () => void;
  resultCount: number;
  loading:     boolean;
}) {
  const hasActive = Object.values(filters).some((v) => v !== "");

  return (
    <div className="sticky top-0 z-10 bg-[#050B14]/80 backdrop-blur-xl border-b border-slate-800/60 px-6 py-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="İsim veya Cüzdan No ara…"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10 transition-all"
            />
          </div>

          {/* Rank */}
          <div className="relative sm:w-44">
            <select
              value={filters.rank}
              onChange={(e) => onChange({ ...filters, rank: e.target.value })}
              className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10 transition-all pr-8"
            >
              <option value="">Tüm Rütbeler</option>
              {RANK_PRESETS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Ship type */}
          <div className="relative sm:w-44">
            <select
              value={filters.type}
              onChange={(e) => onChange({ ...filters, type: e.target.value })}
              className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10 transition-all pr-8"
            >
              <option value="">Tüm Gemi Tipleri</option>
              {SHIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Min GRT */}
          <div className="relative sm:w-36">
            <input
              type="number"
              min={0}
              placeholder="Min GRT"
              value={filters.minGrt}
              onChange={(e) => onChange({ ...filters, minGrt: e.target.value })}
              className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Reset */}
          {hasActive && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Sıfırla
            </button>
          )}
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-xs text-slate-500 mt-2.5">
            {resultCount === 0
              ? "Filtreye uygun aday bulunamadı."
              : <><span className="text-violet-300 font-semibold">{resultCount}</span> aday listeleniyor</>
            }
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
        {hasFilters ? (
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        )}
      </div>
      <h3 className="text-base font-bold text-white mb-2">
        {hasFilters ? "Kriterlere uyan aday bulunamadı" : "Henüz kayıtlı aday yok"}
      </h3>
      <p className="text-sm text-slate-400 max-w-xs">
        {hasFilters
          ? "Farklı filtreler deneyin veya kriterleri genişletin."
          : "Platforma kayıtlı denizciler burada listelenecek."}
      </p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function CandidatesPage() {
  const { dict } = useDashUser();
  const t = dict.dashboard;
  const [all,     setAll]     = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("profiles")
      .select("id, full_name, nationality, city, seaman_book_no, sea_service(*), certificates(*)")
      .eq("role", "candidate")
      .order("full_name", { ascending: true });

    if (err) {
      setError("Adaylar yüklenirken bir hata oluştu.");
    } else {
      setAll((data ?? []) as unknown as CandidateProfile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);
  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-4 max-w-5xl mx-auto w-full">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-violet-400 inline-block" />
          {t.cand_heading}
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 ml-3">
          {t.cand_subheading}
        </p>
      </div>

      {/* ── Filter Bar (sticky) ──────────────────────────────────────── */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
        resultCount={filtered.length}
        loading={loading}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="px-6 py-6 max-w-5xl mx-auto w-full flex-1">

        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
            <button onClick={fetchCandidates} className="ml-auto text-xs underline hover:no-underline cursor-pointer">Tekrar Dene</button>
          </div>
        )}

        {loading ? (
          /* Skeleton grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => <CandidateCard key={c.id} candidate={c} />)}
          </div>
        )}

        {/* Bottom info */}
        {!loading && !error && all.length > 0 && (
          <p className="text-xs text-center text-slate-700 mt-8">
            Platformda toplam <span className="text-slate-500 font-medium">{all.length}</span> kayıtlı denizci bulunuyor.
          </p>
        )}
      </div>
    </div>
  );
}
