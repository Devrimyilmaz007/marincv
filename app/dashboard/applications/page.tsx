"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useDashUser } from "../_context";
import { typeGradient } from "@/lib/vessel-data";

/* ── Types ──────────────────────────────────────────────────────────────── */
type AppStatus = "bekliyor" | "incelendi" | "onaylandi" | "reddedildi";

interface EmployerSnippet {
  full_name: string;
  city:      string | null;
}

interface JobSnippet {
  id:          string;
  title:       string;
  vessel_type: string;
  profiles:    EmployerSnippet | null;
}

interface Application {
  id:           string;
  status:       AppStatus;
  created_at:   string;
  job_postings: JobSnippet | null;
}

/* ── Status metadata ─────────────────────────────────────────────────────── */
const STATUS_META: Record<AppStatus, {
  label: string;
  dot:   string;
  bg:    string;
  text:  string;
  border: string;
}> = {
  bekliyor:   { label: "Bekliyor",   dot: "bg-amber-400",   bg: "bg-amber-400/10",   text: "text-amber-400",   border: "border-amber-400/20"   },
  incelendi:  { label: "İncelendi",  dot: "bg-violet-400",  bg: "bg-violet-400/10",  text: "text-violet-400",  border: "border-violet-400/20"  },
  onaylandi:  { label: "Onaylandı",  dot: "bg-emerald-400", bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20" },
  reddedildi: { label: "Reddedildi", dot: "bg-red-400",     bg: "bg-red-400/10",     text: "text-red-400",     border: "border-red-400/20"     },
};

const STATUS_ORDER: AppStatus[] = ["bekliyor", "incelendi", "onaylandi", "reddedildi"];

/* ── Ship-type gradient ──────────────────────────────────────────────────── */

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-slate-700/50 ${className ?? ""}`} aria-hidden="true" />;
}

function CardSkeleton() {
  return (
    <div className="bg-[#0B1221]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-700/60 shrink-0" />
          <div className="flex-1 min-w-0 pt-0.5">
            <Skeleton className="h-4 w-44 mb-2" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-7 w-24 rounded-xl shrink-0" />
      </div>
      <div className="h-px bg-slate-800 mb-4" />
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/* ── Status Badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: AppStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${m.bg} ${m.text} ${m.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} aria-hidden="true" />
      {m.label}
    </span>
  );
}

/* ── Stats Bar ───────────────────────────────────────────────────────────── */
function StatsBar({ apps }: { apps: Application[] }) {
  const counts = STATUS_ORDER.reduce<Record<AppStatus, number>>((acc, s) => {
    acc[s] = apps.filter((a) => a.status === s).length;
    return acc;
  }, { bekliyor: 0, incelendi: 0, onaylandi: 0, reddedildi: 0 });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {STATUS_ORDER.map((s) => {
        const m = STATUS_META[s];
        return (
          <div key={s} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${m.bg} ${m.border}`}>
            <span className={`w-2 h-2 rounded-full ${m.dot} shrink-0`} aria-hidden="true" />
            <div>
              <p className={`text-lg font-bold leading-none ${m.text}`}>{counts[s]}</p>
              <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Application Card ────────────────────────────────────────────────────── */
function AppCard({ app }: { app: Application }) {
  const job      = app.job_postings;
  const employer = job?.profiles ?? null;
  const gradient = typeGradient(job?.vessel_type ?? "");

  return (
    <div className="bg-[#0B1221]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:shadow-lg hover:shadow-black/20 transition-all duration-200">

      {/* ── Top row: employer avatar + title + status ─────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          {/* Employer avatar */}
          <div
            className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs shadow-md`}
            aria-hidden="true"
          >
            {employer ? employer.full_name.slice(0, 2).toUpperCase() : "?"}
          </div>

          <div className="min-w-0">
            {/* Company name */}
            <p className="text-sm font-bold text-white leading-snug truncate">
              {employer?.full_name ?? "Armatör"}
            </p>
            {/* City */}
            {employer?.city && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {employer.city}
              </p>
            )}
          </div>
        </div>

        {/* Status badge — always visible */}
        <StatusBadge status={app.status} />
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="h-px bg-slate-800/80 mb-4" />

      {/* ── Bottom row: vessel badge + job title + date ───────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Vessel type badge */}
          {job?.vessel_type && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${gradient} shadow-sm`}>
              {job.vessel_type}
            </span>
          )}
          {/* Job title */}
          {job?.title && (
            <span className="text-xs font-semibold text-slate-300 truncate">
              {job.title}
            </span>
          )}
        </div>

        {/* Date */}
        <p className="text-xs text-slate-600 shrink-0">
          {fmtDate(app.created_at)}
        </p>
      </div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-[#00D2FF]/10 border border-[#00D2FF]/20 flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-[#00D2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-white mb-2">
        Henüz bir ilana başvurmadınız
      </h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
        İlan Panosu&apos;nda filonuza uygun pozisyonları keşfedin ve tek tıkla başvurun.
      </p>
      <Link
        href="/dashboard/job-board"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D2FF] text-[#050B14] text-sm font-bold hover:bg-[#00BBE0] transition-colors shadow-lg shadow-[#00D2FF]/20"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
        İlan Panosuna Git
      </Link>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function ApplicationsPage() {
  const { user } = useDashUser();

  const [apps,      setApps]      = useState<Application[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppStatus | "hepsi">("hepsi");

  /* ── Fetch ──────────────────────────────────────────────────────────── */
  const fetchApps = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        job_postings (
          id,
          title,
          vessel_type,
          profiles!employer_id ( full_name, city )
        )
      `)
      .eq("candidate_id", user.id)
      .order("created_at", { ascending: false });

    if (err) {
      setError("Başvurular yüklenirken bir hata oluştu.");
    } else {
      setApps((data ?? []) as unknown as Application[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  /* ── Filtering ──────────────────────────────────────────────────────── */
  const displayed = activeTab === "hepsi"
    ? apps
    : apps.filter((a) => a.status === activeTab);

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-6 max-w-4xl mx-auto w-full">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-[#00D2FF] inline-block" />
          Başvurularım
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 ml-3">
          İş başvurularınızın güncel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="px-6 pb-10 max-w-4xl mx-auto w-full flex-1">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
            <button onClick={fetchApps} className="ml-auto text-xs underline hover:no-underline cursor-pointer">
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>

        /* Empty */
        ) : apps.length === 0 ? (
          <EmptyState />

        ) : (
          <>
            {/* Stats */}
            <StatsBar apps={apps} />

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(["hepsi", ...STATUS_ORDER] as const).map((tab) => {
                const count = tab === "hepsi"
                  ? apps.length
                  : apps.filter((a) => a.status === tab).length;
                if (tab !== "hepsi" && count === 0) return null;
                const isActive = tab === activeTab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-[#00D2FF]/15 border-[#00D2FF]/30 text-[#00D2FF]"
                        : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:border-slate-600/60"
                    }`}
                  >
                    {tab === "hepsi" ? "Tümü" : STATUS_META[tab].label}
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold leading-none ${
                      isActive
                        ? "bg-[#00D2FF]/20 text-[#00D2FF]"
                        : "bg-slate-700/60 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Application cards */}
            {displayed.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-500">
                Bu kategoride başvuru bulunmuyor.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {displayed.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            )}

            <p className="text-xs text-center text-slate-700 mt-8">
              Toplam{" "}
              <span className="text-slate-500 font-medium">{apps.length}</span>{" "}
              başvuru
            </p>
          </>
        )}
      </div>
    </div>
  );
}
