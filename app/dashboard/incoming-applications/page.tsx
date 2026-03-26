"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useDashUser } from "../_context";

/* ── Types ──────────────────────────────────────────────────────────────── */
type AppStatus = "bekliyor" | "incelendi" | "onaylandi" | "reddedildi";

interface CandidateSnippet {
  id:             string;
  full_name:      string;
  seaman_book_no: string | null;
  avatar_url:     string | null;
}

interface JobSnippet {
  id:    string;
  title: string;
}

interface Application {
  id:           string;
  status:       AppStatus;
  created_at:   string;
  job_postings: JobSnippet   | null;
  profiles:     CandidateSnippet | null;
}

interface ToastMsg {
  type:    "success" | "error" | "info";
  message: string;
}

/* ── Status metadata (labels overridden by dict at runtime) ─────────────── */
const STATUS_STYLE: Record<AppStatus, { dot: string; bg: string; text: string; border: string }> = {
  bekliyor:   { dot: "bg-amber-400",   bg: "bg-amber-400/10",   text: "text-amber-400",   border: "border-amber-400/20"   },
  incelendi:  { dot: "bg-violet-400",  bg: "bg-violet-400/10",  text: "text-violet-400",  border: "border-violet-400/20"  },
  onaylandi:  { dot: "bg-emerald-400", bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/20" },
  reddedildi: { dot: "bg-red-400",     bg: "bg-red-400/10",     text: "text-red-400",     border: "border-red-400/20"     },
};

function useStatusMeta() {
  const { dict } = useDashUser();
  const d = dict.dashboard;
  return {
    bekliyor:   { label: d.ia_status_pending,  ...STATUS_STYLE.bekliyor   },
    incelendi:  { label: d.ia_status_reviewed, ...STATUS_STYLE.incelendi  },
    onaylandi:  { label: d.ia_status_approved, ...STATUS_STYLE.onaylandi  },
    reddedildi: { label: d.ia_status_rejected, ...STATUS_STYLE.reddedildi },
  } as Record<AppStatus, { label: string; dot: string; bg: string; text: string; border: string }>;
}

const STATUS_ORDER: AppStatus[] = ["bekliyor", "incelendi", "onaylandi", "reddedildi"];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
}

/* ── Primitives ──────────────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-slate-700/40 ${className ?? ""}`} aria-hidden="true" />;
}

function RowSkeleton() {
  return (
    <div className="bg-[#0D1629] border border-slate-700/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-pulse">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-slate-700/60 shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="flex items-center gap-3 sm:ml-auto flex-wrap">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ toast, onDismiss }: { toast: ToastMsg; onDismiss: () => void }) {
  const styles = {
    success: "bg-emerald-950/90 border-emerald-500/30 text-emerald-300",
    error:   "bg-red-950/90     border-red-500/30     text-red-300",
    info:    "bg-violet-950/90  border-violet-500/30  text-violet-300",
  };
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl text-sm font-medium backdrop-blur-xl ${styles[toast.type]}`}
    >
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {toast.type === "success"
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          : toast.type === "error"
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        }
      </svg>
      {toast.message}
      <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Kapat">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

/* ── Status Badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: AppStatus }) {
  const meta = useStatusMeta();
  const m = meta[status] ?? STATUS_STYLE.bekliyor;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${m.bg} ${m.text} ${m.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {"label" in m ? (m as { label: string }).label : status}
    </span>
  );
}

/* ── Status Dropdown ─────────────────────────────────────────────────────── */
function StatusSelect({ appId, current, onUpdate }: {
  appId:    string;
  current:  AppStatus;
  onUpdate: (id: string, next: AppStatus) => Promise<void>;
}) {
  const meta = useStatusMeta();
  const [saving, setSaving] = useState(false);
  const m = meta[current] ?? STATUS_STYLE.bekliyor;

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as AppStatus;
    if (next === current) return;
    setSaving(true);
    await onUpdate(appId, next);
    setSaving(false);
  }

  return (
    <div className="relative">
      {saving && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      )}
      <select
        value={current}
        onChange={handleChange}
        disabled={saving}
        className={`appearance-none pl-7 pr-8 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-60 disabled:cursor-wait ${m.bg} ${m.text} ${m.border} bg-opacity-80`}
        aria-label="Başvuru durumunu değiştir"
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>{meta[s].label}</option>
        ))}
      </select>
      {/* Colored dot + chevron overlay */}
      {!saving && (
        <span className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${m.dot}`} />
      )}
      <svg className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${m.text} opacity-70`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

/* ── Application Row ─────────────────────────────────────────────────────── */
function AppRow({ app, onUpdate }: {
  app:      Application;
  onUpdate: (id: string, next: AppStatus) => Promise<void>;
}) {
  const candidate = app.profiles;
  const job       = app.job_postings;
  const initials  = getInitials(candidate?.full_name);

  /* Violet gradient for candidate avatars */
  const VIOLET_GRADIENTS = [
    "from-violet-600 to-purple-500",
    "from-indigo-600 to-violet-500",
    "from-fuchsia-600 to-violet-500",
  ];
  const grad = VIOLET_GRADIENTS[(candidate?.full_name?.charCodeAt(0) ?? 0) % VIOLET_GRADIENTS.length];

  return (
    <div className="bg-[#0D1629] border border-slate-700/40 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-violet-500/20 hover:bg-[#0F1835] transition-all duration-200 group">

      {/* ── Candidate ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden shadow-md">
          {candidate?.avatar_url ? (
            <img
              src={candidate.avatar_url}
              alt={candidate.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-xs`}>
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0">
          {candidate ? (
            <Link
              href={`/dashboard/candidates/${candidate.id}`}
              className="text-sm font-bold text-white hover:text-violet-300 transition-colors leading-snug block truncate group/link"
            >
              {candidate.full_name}
              <svg className="inline-block w-3 h-3 ml-1 opacity-0 group-hover/link:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          ) : (
            <span className="text-sm font-bold text-slate-400">Bilinmiyor</span>
          )}
          {candidate?.seaman_book_no && (
            <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
              Cüzdan: {candidate.seaman_book_no}
            </p>
          )}
        </div>
      </div>

      {/* ── Job title ───────────────────────────────────────────────── */}
      <div className="min-w-0 sm:max-w-[220px] flex-shrink-0">
        <p className="text-xs text-slate-500 mb-0.5">İlan</p>
        {job ? (
          <p className="text-xs font-semibold text-slate-300 truncate leading-snug" title={job.title}>
            {job.title}
          </p>
        ) : (
          <p className="text-xs text-slate-600 italic">İlan bulunamadı</p>
        )}
      </div>

      {/* ── Date ────────────────────────────────────────────────────── */}
      <div className="shrink-0 hidden md:block">
        <p className="text-xs text-slate-500 mb-0.5">Tarih</p>
        <p className="text-xs text-slate-400">{fmtDate(app.created_at)}</p>
      </div>

      {/* ── Status select ───────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 sm:ml-2">
        <StatusSelect appId={app.id} current={app.status} onUpdate={onUpdate} />
        {/* CV link button */}
        {candidate && (
          <Link
            href={`/dashboard/candidates/${candidate.id}`}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all"
            title="CV'yi İncele"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-white mb-2">Henüz başvuru yok</h3>
      <p className="text-sm text-slate-400 max-w-xs">
        İlanlarınız aktif oldukça aday başvuruları burada görünecek.
      </p>
      <Link
        href="/dashboard/jobs"
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/25 text-violet-300 text-sm font-medium hover:bg-violet-600/30 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        İlan Oluştur
      </Link>
    </div>
  );
}

/* ── Stats Bar ───────────────────────────────────────────────────────────── */
function StatsBar({ apps }: { apps: Application[] }) {
  const meta = useStatusMeta();
  const counts = STATUS_ORDER.reduce<Record<AppStatus, number>>((acc, s) => {
    acc[s] = apps.filter((a) => a.status === s).length;
    return acc;
  }, { bekliyor: 0, incelendi: 0, onaylandi: 0, reddedildi: 0 });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {STATUS_ORDER.map((s) => {
        const m = meta[s];
        return (
          <div key={s} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${m.bg} ${m.border}`}>
            <span className={`w-2 h-2 rounded-full ${m.dot} shrink-0`} />
            <div>
              <p className={`text-lg font-bold ${m.text} leading-none`}>{counts[s]}</p>
              <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function IncomingApplicationsPage() {
  const { user, locale, dict } = useDashUser();
  const t = dict.dashboard;
  const statusMeta = useStatusMeta();

  const [apps,    setApps]    = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [toast,   setToast]   = useState<ToastMsg | null>(null);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Fetch ──────────────────────────────────────────────────────────── */
  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data, error: err } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        job_postings ( id, title ),
        profiles!candidate_id ( id, full_name, seaman_book_no, avatar_url )
      `)
      .order("created_at", { ascending: false });

    if (err) {
      setError("Başvurular yüklenirken bir hata oluştu.");
    } else {
      setApps((data ?? []) as unknown as Application[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  /* ── Status Update ──────────────────────────────────────────────────── */
  const handleStatusUpdate = useCallback(async (id: string, next: AppStatus) => {
    /* Optimistic update */
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: next } : a));

    const supabase = createClient();
    const { error: err } = await supabase
      .from("applications")
      .update({ status: next })
      .eq("id", id);

    if (err) {
      /* Rollback — re-fetch to restore correct state */
      setToast({ type: "error", message: `Durum güncellenemedi: ${err.message}` });
      fetchApps();
    } else {
      setToast({ type: "success", message: t.ia_updated });
    }
  }, [fetchApps]);

  /* ── Filter by status tab (optional quick tabs) ─────────────────────── */
  const [activeTab, setActiveTab] = useState<AppStatus | "hepsi">("hepsi");

  const displayed = activeTab === "hepsi"
    ? apps
    : apps.filter((a) => a.status === activeTab);

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-6 max-w-4xl mx-auto w-full">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-violet-500 inline-block" />
          {t.ia_heading}
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 ml-3">
          {t.ia_subheading}
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="px-6 pb-8 max-w-4xl mx-auto w-full flex-1">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            {error}
            <button onClick={fetchApps} className="ml-auto text-xs underline hover:no-underline cursor-pointer">Tekrar Dene</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => <RowSkeleton key={i} />)}
          </div>

        ) : apps.length === 0 ? (
          <EmptyState />

        ) : (
          <>
            {/* Stats */}
            <StatsBar apps={apps} />

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(["hepsi", ...STATUS_ORDER] as const).map((tab) => {
                const isActive = tab === activeTab;
                const count = tab === "hepsi" ? apps.length : apps.filter((a) => a.status === tab).length;
                if (tab !== "hepsi" && count === 0) return null;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                        : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:border-slate-600/60"
                    }`}
                  >
                    {tab === "hepsi" ? (locale === "en" ? "All" : "Tümü") : statusMeta[tab].label}
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold leading-none ${isActive ? "bg-violet-500/30 text-violet-200" : "bg-slate-700/60 text-slate-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* List */}
            {displayed.length === 0 ? (
              <div className="text-center py-12 text-sm text-slate-500">
                Bu kategoride başvuru bulunmuyor.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {displayed.map((app) => (
                  <AppRow key={app.id} app={app} onUpdate={handleStatusUpdate} />
                ))}
              </div>
            )}

            <p className="text-xs text-center text-slate-700 mt-8">
              Toplam <span className="text-slate-500 font-medium">{apps.length}</span> başvuru
            </p>
          </>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
