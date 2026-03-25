"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Locale } from "@/lib/dictionaries";
import trDict from "@/dictionaries/tr.json";
import enDict from "@/dictionaries/en.json";
import { SHIP_TYPES, RANK_PRESETS, typeGradient } from "@/lib/vessel-data";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface EmployerSnippet { full_name: string; city?: string | null }
interface JobPosting {
  id: string; employer_id: string; title: string; vessel_type: string;
  rank_req: string; grt_req: number | null; contract_duration: string;
  status: string; created_at: string; profiles: EmployerSnippet | null;
}

/* ── Presets (value = Turkish DB key, label = translated display) ─────────── */
const SHIP_TYPE_KEYS = [...SHIP_TYPES];
const RANK_KEYS = [...RANK_PRESETS];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", { day:"numeric", month:"short", year:"numeric" });
}
function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0,2).map((w) => w[0].toUpperCase()).join("");
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Sk({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-slate-700/50 ${className??""}`} aria-hidden />;
}
function CardSkeleton() {
  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-700/60 shrink-0" />
        <div className="flex-1"><Sk className="h-4 w-48 mb-2" /><Sk className="h-3 w-32" /></div>
        <Sk className="h-3 w-20 shrink-0" />
      </div>
      <div className="h-px bg-slate-800 mb-4" />
      <div className="flex gap-2 mb-5"><Sk className="h-6 w-28 rounded-lg" /><Sk className="h-6 w-20 rounded-lg" /><Sk className="h-6 w-16 rounded-lg" /></div>
      <div className="flex justify-end"><Sk className="h-10 w-40 rounded-xl" /></div>
    </div>
  );
}

/* ── Empty ───────────────────────────────────────────────────────────────── */
function EmptyState({ hasFilters, t }: { hasFilters: boolean; t: typeof trDict.jobs_page }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-white mb-2">
        {hasFilters ? t.empty_filters : t.empty_none}
      </h3>
      <p className="text-sm text-slate-400 max-w-xs">
        {hasFilters ? t.empty_filters_sub : t.empty_none_sub}
      </p>
    </div>
  );
}

/* ── Job Card ────────────────────────────────────────────────────────────── */
function JobCard({ job, loginLabel }: { job: JobPosting; loginLabel: string }) {
  const employer = job.profiles;
  const gradient = typeGradient(job.vessel_type);
  const initials = employer ? getInitials(employer.full_name) : "?";
  return (
    <div className="bg-[#0B1221]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-[#00D2FF]/20 hover:shadow-xl hover:shadow-[#00D2FF]/5 transition-all duration-300">
      <div className="flex items-start gap-3 mb-4 flex-wrap">
        <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white leading-snug">{job.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {employer?.full_name ?? "—"}
            {employer?.city && <span className="text-slate-600"> · {employer.city}</span>}
          </p>
        </div>
        <span className="text-xs text-slate-600 shrink-0 self-start">{fmtDate(job.created_at)}</span>
      </div>
      <div className="h-px bg-white/5 mb-4" />
      <div className="flex flex-wrap gap-2 mb-5">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${gradient}`}>{job.vessel_type}</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-300">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
          {job.rank_req}
        </span>
        {job.grt_req && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-xs font-medium text-[#00D2FF]">
            Min. {job.grt_req.toLocaleString("tr-TR")} GRT
          </span>
        )}
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-300">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {job.contract_duration}
        </span>
      </div>
      <div className="flex justify-end">
        <Link href="/login"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#00D2FF]/40 text-[#00D2FF] text-sm font-semibold hover:bg-[#00D2FF]/10 transition-all duration-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
          {loginLabel}
        </Link>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function PublicJobsContent({ locale }: { locale: Locale }) {
  const d = locale === "en" ? enDict : trDict;
  const t = d.jobs_page;
  const shipTypeMap = d.ship_types as Record<string, string>;
  const rankMap     = d.ranks     as Record<string, string>;

  const [jobs,       setJobs]       = useState<JobPosting[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterRank, setFilterRank] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("job_postings")
        .select("*, profiles!employer_id(full_name, city)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (err) setError(t.load_error);
      else setJobs((data ?? []) as unknown as JobPosting[]);
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => jobs.filter((j) => {
    if (filterType && j.vessel_type !== filterType) return false;
    if (filterRank && !j.rank_req.toLowerCase().includes(filterRank.toLowerCase())) return false;
    return true;
  }), [jobs, filterType, filterRank]);

  const hasFilters = filterType !== "" || filterRank !== "";

  return (
    <div className="min-h-screen bg-[#050B14]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D2FF] to-transparent blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-20">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse" />
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">{t.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">{t.heading}</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">{t.subtitle}</p>
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
          <div className="relative flex-1">
            <select value={filterRank} onChange={(e) => setFilterRank(e.target.value)}
              className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all pr-9">
              <option value="">{t.all_ranks}</option>
              {RANK_KEYS.map((r) => <option key={r} value={r}>{rankMap[r] ?? r}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          {hasFilters && (
            <button onClick={() => { setFilterType(""); setFilterRank(""); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all cursor-pointer shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              {t.reset}
            </button>
          )}
        </div>

        {/* Result count */}
        {!loading && !error && (
          <p className="text-xs text-slate-500 mb-5 text-center">
            {filtered.length === 0
              ? t.no_match
              : <><span className="text-[#00D2FF] font-semibold">{filtered.length}</span> {t.active_count}</>
            }
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
        {loading
          ? <div className="flex flex-col gap-4">{[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}</div>
          : filtered.length === 0
            ? <EmptyState hasFilters={hasFilters} t={t} />
            : <div className="flex flex-col gap-4">{filtered.map((j) => <JobCard key={j.id} job={j} loginLabel={t.login_to_apply} />)}</div>
        }

        {/* Bottom CTA */}
        {!loading && filtered.length > 0 && (
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#00D2FF]/10 to-blue-600/10 border border-[#00D2FF]/15 text-center">
            <p className="text-sm font-semibold text-white mb-1">{t.cta_title}</p>
            <p className="text-xs text-slate-400 mb-4">{t.cta_subtitle}</p>
            <Link href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00D2FF] text-[#050B14] text-sm font-bold hover:bg-white transition-all duration-200 shadow-lg shadow-[#00D2FF]/20">
              {t.cta_button}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
