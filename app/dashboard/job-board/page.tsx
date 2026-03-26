"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDashUser } from "../_context";
import { SHIP_TYPES, RANK_PRESETS, typeGradient } from "@/lib/vessel-data";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface EmployerSnippet {
  full_name: string;
  city:      string | null;
  logo_url:  string | null;
}

interface JobPosting {
  id:                string;
  employer_id:       string;
  title:             string;
  vessel_type:       string;
  rank_req:          string;
  grt_req:           number | null;
  contract_duration: string;
  status:            string;
  created_at:        string;
  profiles:          EmployerSnippet | null;   // embedded via FK
}

interface ToastMsg {
  type:    "success" | "error" | "info";
  message: string;
}


/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function getInitialsFromName(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

/* ── Primitives ──────────────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-slate-700/50 ${className ?? ""}`} aria-hidden="true" />;
}

function CardSkeleton() {
  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-700/60 shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-xl shrink-0" />
      </div>
      <div className="h-px bg-slate-800 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-28 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
      <div className="flex justify-between items-center">
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
    info:    "bg-slate-900/90   border-slate-600/40   text-slate-300",
  };
  const icons = {
    success: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
    error:   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />,
    info:    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />,
  };
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl text-sm font-medium backdrop-blur-xl ${styles[toast.type]}`}
    >
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{icons[toast.type]}</svg>
      {toast.message}
      <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Kapat">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

/* ── Apply Button ────────────────────────────────────────────────────────── */
type ApplyState = "idle" | "loading" | "applied";

function ApplyButton({ jobId, initialState, userId, onToast }: {
  jobId:        string;
  initialState: ApplyState;
  userId:       string | undefined;
  onToast:      (t: ToastMsg) => void;
}) {
  const { dict } = useDashUser();
  const tb = dict.dashboard;
  const [state, setState] = useState<ApplyState>(initialState);

  async function apply() {
    if (state !== "idle" || !userId) return;
    setState("loading");

    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .insert({ job_id: jobId, candidate_id: userId, status: "pending" });

    if (error) {
      setState("idle");
      if (error.code === "23505") {
        onToast({ type: "info", message: "Bu ilana zaten başvurdunuz." });
      } else {
        onToast({ type: "error", message: error.message });
      }
    } else {
      setState("applied");
      onToast({ type: "success", message: "Başvurunuz başarıyla iletildi!" });
    }
  }

  if (state === "applied") {
    return (
      <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        {tb.jb_applied}
      </div>
    );
  }

  return (
    <button
      onClick={apply}
      disabled={state === "loading" || !userId}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D2FF] text-[#050B14] text-sm font-semibold hover:bg-white transition-all duration-200 shadow-md shadow-[#00D2FF]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
    >
      {state === "loading" ? (
        <>
          <span className="w-4 h-4 border-2 border-[#050B14]/25 border-t-[#050B14] rounded-full animate-spin" />
          {tb.jb_applying}
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          {tb.jb_apply}
        </>
      )}
    </button>
  );
}

/* ── Job Card ────────────────────────────────────────────────────────────── */
function JobCard({ job, userId, appliedIds, onToast }: {
  job:        JobPosting;
  userId:     string | undefined;
  appliedIds: Set<string>;
  onToast:    (t: ToastMsg) => void;
}) {
  const employer   = job.profiles;
  const gradient   = typeGradient(job.vessel_type);
  const initials   = employer ? getInitialsFromName(employer.full_name) : "?";
  const initialApplyState: ApplyState = appliedIds.has(job.id) ? "applied" : "idle";

  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6 hover:border-[#00D2FF]/20 hover:shadow-lg hover:shadow-[#00D2FF]/5 transition-all duration-300 group">

      {/* ── Top: employer + apply ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          {/* Employer avatar */}
          <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden shadow-md">
            {employer?.logo_url ? (
              <img
                src={employer.logo_url}
                alt={employer.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs`}>
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white leading-snug">{job.title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs text-slate-400 truncate">
                {employer?.full_name ?? "Armatör"}
              </span>
              {employer?.city && (
                <>
                  <span className="text-slate-700" aria-hidden="true">·</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    {employer.city}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Posted date */}
        <span className="text-xs text-slate-600 shrink-0 self-start mt-1">
          {fmtDate(job.created_at)}
        </span>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────── */}
      <div className="h-px bg-slate-800 mb-4" />

      {/* ── Chips ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${gradient} shadow-sm`}>
          {job.vessel_type}
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-300">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          {job.rank_req}
        </span>
        {job.grt_req && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-xs font-medium text-[#00D2FF]">
            Min. {job.grt_req.toLocaleString("tr-TR")} GRT
          </span>
        )}
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-300">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {job.contract_duration}
        </span>
      </div>

      {/* ── Bottom: meta + apply ────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-slate-600">
          İlan No: <span className="font-mono text-slate-500">{job.id.slice(0, 8).toUpperCase()}</span>
        </p>
        <ApplyButton
          jobId={job.id}
          initialState={initialApplyState}
          userId={userId}
          onToast={onToast}
        />
      </div>
    </div>
  );
}

/* ── Filter Bar ──────────────────────────────────────────────────────────── */
function FilterBar({ type, rank, onChange, onReset, count, loading }: {
  type:     string;
  rank:     string;
  onChange: (k: "type" | "rank", v: string) => void;
  onReset:  () => void;
  count:    number;
  loading:  boolean;
}) {
  const hasActive = type !== "" || rank !== "";

  return (
    <div className="sticky top-0 z-10 bg-[#050B14]/80 backdrop-blur-xl border-b border-slate-800/60 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Ship type */}
          <div className="relative sm:flex-1">
            <select
              value={type}
              onChange={(e) => onChange("type", e.target.value)}
              className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all pr-9"
            >
              <option value="">Tüm Gemi Tipleri</option>
              {SHIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* Rank */}
          <div className="relative sm:flex-1">
            <select
              value={rank}
              onChange={(e) => onChange("rank", e.target.value)}
              className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all pr-9"
            >
              <option value="">Tüm Rütbeler</option>
              {RANK_PRESETS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>

          {hasActive && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-all cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              Sıfırla
            </button>
          )}
        </div>

        {!loading && (
          <p className="text-xs text-slate-500 mt-2.5">
            {count === 0
              ? "Filtreye uygun ilan bulunamadı."
              : <><span className="text-[#00D2FF] font-semibold">{count}</span> aktif ilan listeleniyor</>
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
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-white mb-2">
        {hasFilters ? "Filtreye uygun ilan bulunamadı" : "Şu an aktif ilan yok"}
      </h3>
      <p className="text-sm text-slate-400 max-w-xs">
        {hasFilters
          ? "Farklı filtreler deneyin veya kriterleri genişletin."
          : "Yeni ilanlar yayınlandığında burada görünecek. Daha sonra tekrar kontrol edin."}
      </p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function JobBoardPage() {
  const { user, dict } = useDashUser();
  const t = dict.dashboard;

  const [jobs,       setJobs]       = useState<JobPosting[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [toast,      setToast]      = useState<ToastMsg | null>(null);
  const [filterType, setFilterType] = useState("");
  const [filterRank, setFilterRank] = useState("");

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Fetch jobs + existing applications ─────────────────────────────── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    /* Active job postings with employer snippet */
    const { data: jobData, error: jobErr } = await supabase
      .from("job_postings")
      .select("*, profiles!employer_id(full_name, city, logo_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (jobErr) {
      setError("İlanlar yüklenirken bir hata oluştu.");
      setLoading(false);
      return;
    }

    setJobs((jobData ?? []) as unknown as JobPosting[]);

    /* Candidate's existing applications (to pre-populate applied state) */
    if (user?.id) {
      const { data: appData } = await supabase
        .from("applications")
        .select("job_id")
        .eq("candidate_id", user.id);

      setAppliedIds(new Set((appData ?? []).map((a: { job_id: string }) => a.job_id)));
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Client-side filtering ──────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (filterType && j.vessel_type !== filterType) return false;
      if (filterRank && !j.rank_req.toLowerCase().includes(filterRank.toLowerCase())) return false;
      return true;
    });
  }, [jobs, filterType, filterRank]);

  const hasFilters = filterType !== "" || filterRank !== "";

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-4 max-w-4xl mx-auto w-full">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-[#00D2FF] inline-block" />
          {t.jb_heading}
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 ml-3">
          {t.jb_subheading}
        </p>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <FilterBar
        type={filterType}
        rank={filterRank}
        onChange={(k, v) => k === "type" ? setFilterType(v) : setFilterRank(v)}
        onReset={() => { setFilterType(""); setFilterRank(""); }}
        count={filtered.length}
        loading={loading}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="px-6 py-6 max-w-4xl mx-auto w-full flex-1">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            {error}
            <button onClick={fetchData} className="ml-auto text-xs underline hover:no-underline cursor-pointer">Tekrar Dene</button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>

        /* Empty state */
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />

        /* Job list */
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  userId={user?.id}
                  appliedIds={appliedIds}
                  onToast={setToast}
                />
              ))}
            </div>

            {/* Bottom count */}
            <p className="text-xs text-center text-slate-700 mt-8">
              Platformda toplam{" "}
              <span className="text-slate-500 font-medium">{jobs.length}</span> aktif ilan bulunuyor.
            </p>
          </>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
