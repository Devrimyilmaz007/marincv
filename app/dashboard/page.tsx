"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useDashUser } from "./_context";
import ImageUpload from "@/components/ImageUpload";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface PersonalInfo {
  /* Candidate-only */
  bookletNo:   string;
  birthDate:   string;
  nationality: string;
  /* Shared */
  city:        string;
  address:     string;
  /* Employer-only */
  companyName: string;
  taxOffice:   string;
  taxNo:       string;
  website:     string;
}

interface SeaRecord {
  id:            string;
  ship_name:     string;
  ship_type:     string;
  rank:          string;
  grt:           number | null;
  sign_on_date:  string;
  sign_off_date: string | null;
}

interface Certificate {
  id:          string;
  name:        string;
  expiry_date: string | null;
}

interface EmployerStats {
  activeJobs:  number;
  totalApps:   number;
  pendingApps: number;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

/* ── Constants ───────────────────────────────────────────────────────────── */
const NATIONALITIES = [
  "Türkiye", "Filipinler", "Birleşik Krallık",
  "Amerika Birleşik Devletleri", "Yunanistan", "Hırvatistan", "Rusya", "Diğer",
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatRole(raw: string): string {
  const map: Record<string, string> = {
    candidate: "Denizci / Aday",
    employer:  "Armatör / İşveren",
    agency:    "Acente",
    denizci:   "Denizci / Aday",
    armatör:   "Armatör / İşveren",
  };
  return map[raw?.toLowerCase()] ?? raw ?? "Denizci";
}

function totalServiceMonths(records: SeaRecord[]): number {
  return records.reduce((acc, r) => {
    const on  = new Date(r.sign_on_date).getTime();
    const off = r.sign_off_date ? new Date(r.sign_off_date).getTime() : Date.now();
    return acc + Math.max(0, (off - on) / (1000 * 60 * 60 * 24 * 30.44));
  }, 0);
}

function fmtDuration(months: number): string {
  if (months === 0) return "—";
  const y = Math.floor(months / 12);
  const m = Math.round(months % 12);
  if (y === 0) return `${m} ay`;
  if (m === 0) return `${y} yıl`;
  return `${y} yıl ${m} ay`;
}

function highestGRT(records: SeaRecord[]): number {
  return records.reduce((max, r) => Math.max(max, r.grt ?? 0), 0);
}

function certIsValid(expiry: string | null): boolean {
  if (!expiry) return true;
  return new Date(expiry).getTime() > Date.now();
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Profile completion ──────────────────────────────────────────────────── */
interface CompletionItem { label: string; done: boolean }

function calcCompletion(
  role: string,
  personal: PersonalInfo,
  phone: string,
  avatarUrl: string,
  sea: SeaRecord[],
  certs: Certificate[],
  employerStats: EmployerStats | null,
): { items: CompletionItem[]; pct: number } {
  const isEmployer = role === "employer";

  const items: CompletionItem[] = isEmployer
    ? [
        { label: "Şirket Adı",        done: true               },
        { label: "Telefon",            done: !!phone            },
        { label: "Şehir / Konum",      done: !!personal.city   },
        { label: "Şirket Logosu",      done: !!avatarUrl        },
        { label: "İlk İlan Yayınlandı",done: (employerStats?.activeJobs ?? 0) > 0 },
      ]
    : [
        { label: "Kişisel Bilgiler",   done: true               },
        { label: "Telefon",            done: !!phone            },
        { label: "Şehir / Konum",      done: !!personal.city   },
        { label: "Profil Fotoğrafı",   done: !!avatarUrl        },
        { label: "Denizcilik Cüzdanı", done: !!personal.bookletNo },
        { label: "Deniz Hizmeti",      done: sea.length > 0    },
        { label: "STCW / Belgeler",    done: certs.length > 0  },
      ];

  const doneCount = items.filter((i) => i.done).length;
  const pct       = Math.round((doneCount / items.length) * 100);
  return { items, pct };
}

/* ── UI Primitives ───────────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-slate-700/50 ${className ?? ""}`} aria-hidden="true" />;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">
      {children}
    </label>
  );
}

function DashInput({ value, onChange, placeholder, type = "text", disabled = false }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    />
  );
}

function StatCard({ label, value, sub, accent = false }: {
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-colors">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-[#00D2FF]" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
      <span className="w-1 h-4 rounded-full bg-[#00D2FF] inline-block" />
      {children}
    </h2>
  );
}

function WelcomeSkeleton() {
  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-700/60 shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full mb-3" />
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
      </div>
    </div>
  );
}

function SaveFeedback({ status, errorMsg }: { status: SaveStatus; errorMsg: string }) {
  if (status === "success") return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      Başarıyla kaydedildi.
    </div>
  );
  if (status === "error") return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
      {errorMsg}
    </div>
  );
  return null;
}

/* ── Onboarding Banner ───────────────────────────────────────────────────── */
function OnboardingBanner({ role }: { role: string }) {
  const isEmployer = role === "employer";
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 rounded-2xl bg-amber-500/8 border border-amber-500/25">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4.5 h-4.5 w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-amber-300 leading-snug mb-0.5">Profiliniz henüz tamamlanmadı</p>
          <p className="text-xs text-amber-400/70 leading-relaxed">
            {isEmployer
              ? "İlan yayınlayabilmek ve adaylara ulaşabilmek için şirket profilinizi ve logonuzu güncelleyin."
              : "İlanlara başvurabilmek için profil fotoğrafınızı ve kişisel bilgilerinizi tamamlayın."}
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/settings"
        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-[#050B14] text-xs font-bold hover:bg-amber-400 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
        Profili Tamamla
      </Link>
    </div>
  );
}

/* ── Candidate Right Panel ───────────────────────────────────────────────── */
function CandidatePanel({ sea, certs, loading }: {
  sea:     SeaRecord[];
  certs:   Certificate[];
  loading: boolean;
}) {
  if (loading) return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
            <Skeleton className="h-3 w-24 mb-3" /><Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>
      <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
        <Skeleton className="h-3 w-28 mb-4" /><Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );

  const months      = totalServiceMonths(sea);
  const grt         = highestGRT(sea);
  const uniqueTypes = [...new Set(sea.map((r) => r.ship_type))];
  const sortedSea   = [...sea].sort((a, b) => new Date(b.sign_on_date).getTime() - new Date(a.sign_on_date).getTime());
  const latestRecord = sortedSea[0];
  const validCerts  = certs.filter((c) => certIsValid(c.expiry_date));

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Toplam Deniz Hizmeti" value={fmtDuration(months)} accent />
        <StatCard label="En Yüksek GRT" value={grt > 0 ? grt.toLocaleString("tr-TR") : "—"} sub={grt > 0 ? "GRT" : undefined} />
      </div>

      {/* Current rank */}
      <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-colors">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Mevcut Rütbe</p>
        {latestRecord ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#00D2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{latestRecord.rank}</p>
              <p className="text-xs text-slate-500 mt-0.5">{latestRecord.ship_name}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 italic">Henüz deniz hizmeti girilmedi</p>
        )}
      </div>

      {/* Vessel types */}
      <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-colors flex-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Gemi Deneyimi</p>
        {uniqueTypes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {uniqueTypes.map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 text-xs border border-slate-700/60 hover:border-[#00D2FF]/30 hover:text-[#00D2FF] transition-colors">
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic">Henüz gemi tipi girilmedi</p>
        )}
        {validCerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-2">{validCerts.length} geçerli belge</p>
            <div className="flex flex-wrap gap-1.5">
              {validCerts.slice(0, 3).map((c) => (
                <span key={c.id} className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs truncate max-w-[160px]" title={c.name}>
                  {c.name}
                </span>
              ))}
              {validCerts.length > 3 && (
                <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700/40 text-slate-500 text-xs">
                  +{validCerts.length - 3} daha
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Hızlı Aksiyonlar</p>
        <div className="flex flex-col gap-2">
          {[
            { label: "CV Önizleme",   href: "/dashboard/my-cv",           icon: "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" },
            { label: "CV İndir (PDF)", href: "/dashboard/my-cv?print=true", icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" },
            { label: "İlan Panosu",   href: "/dashboard/job-board",        icon: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" },
          ].map(({ label, href, icon }) => (
            <Link key={href} href={href}
              className="w-full text-left flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-[#00D2FF]/30 transition-all group cursor-pointer"
            >
              <span className="text-xs font-medium text-slate-300 group-hover:text-white">{label}</span>
              <svg className="w-4 h-4 text-slate-500 group-hover:text-[#00D2FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Employer Right Panel ─────────────────────────────────────────────────── */
function EmployerPanel({ stats, loading }: { stats: EmployerStats | null; loading: boolean }) {
  if (loading) return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
            <Skeleton className="h-3 w-24 mb-3" /><Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
        <Skeleton className="h-3 w-28 mb-3" /><Skeleton className="h-7 w-12" />
      </div>
      <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
        <Skeleton className="h-3 w-28 mb-4" />
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-9 w-full rounded-xl mb-2" />)}
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Aktif İlanlar" value={String(stats?.activeJobs ?? 0)} accent />
        <StatCard label="Bekleyen Başvuru" value={String(stats?.pendingApps ?? 0)} />
      </div>

      <StatCard label="Toplam Başvuru" value={String(stats?.totalApps ?? 0)} sub="tüm zamanlar" />

      {/* Quick Actions */}
      <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Hızlı Aksiyonlar</p>
        <div className="flex flex-col gap-2">
          {[
            { label: "Yeni İlan Oluştur",   href: "/dashboard/jobs",                   icon: "M12 4.5v15m7.5-7.5h-15" },
            { label: "Gelen Başvurular",     href: "/dashboard/incoming-applications",   icon: "M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" },
            { label: "Aday Havuzu",          href: "/dashboard/candidates",             icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
          ].map(({ label, href, icon }) => (
            <Link key={href} href={href}
              className="w-full text-left flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-[#00D2FF]/30 transition-all group cursor-pointer"
            >
              <span className="text-xs font-medium text-slate-300 group-hover:text-white">{label}</span>
              <svg className="w-4 h-4 text-slate-500 group-hover:text-[#00D2FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, loading, dict, refreshUser } = useDashUser();
  const t = dict.dashboard;

  const [personal,   setPersonal]   = useState<PersonalInfo>({ bookletNo: "", birthDate: "", nationality: "Türkiye", city: "", address: "", companyName: "", taxOffice: "", taxNo: "", website: "" });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError,  setSaveError]  = useState("");
  const [avatarUrl,  setAvatarUrl]  = useState("");

  /* Role-specific data */
  const [sea,           setSea]           = useState<SeaRecord[]>([]);
  const [certs,         setCerts]         = useState<Certificate[]>([]);
  const [employerStats, setEmployerStats] = useState<EmployerStats | null>(null);
  const [dataLoading,   setDataLoading]   = useState(false);

  /* Fill form from context + fetch employer-specific columns */
  useEffect(() => {
    if (!user) return;
    setAvatarUrl(user.avatarUrl ?? "");

    if (user.role === "employer") {
      const supabase = createClient();
      supabase
        .from("profiles")
        .select("full_name, city, address, tax_office, tax_no, website")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setPersonal((p) => ({
            ...p,
            companyName: data?.full_name  ?? user.fullName ?? "",
            city:        data?.city       ?? user.city     ?? "",
            address:     data?.address    ?? user.address  ?? "",
            taxOffice:   data?.tax_office ?? "",
            taxNo:       data?.tax_no     ?? "",
            website:     data?.website    ?? "",
          }));
        });
    } else {
      setPersonal({
        bookletNo:   user.seamanBookNo,
        birthDate:   user.birthDate,
        nationality: user.nationality || "Türkiye",
        city:        user.city,
        address:     user.address,
        companyName: "",
        taxOffice:   "",
        taxNo:       "",
        website:     "",
      });
    }
  }, [user]);

  /* Fetch role-specific data */
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    async function fetchData() {
      setDataLoading(true);
      if (user!.role === "employer") {
        const [jobsRes, appsRes] = await Promise.all([
          supabase.from("job_postings").select("id, status").eq("employer_id", user!.id),
          supabase.from("applications")
            .select("id, status, job_postings!inner(employer_id)")
            .eq("job_postings.employer_id", user!.id),
        ]);
        const jobs = jobsRes.data ?? [];
        const apps = appsRes.data ?? [];
        setEmployerStats({
          activeJobs:  jobs.filter((j) => j.status === "active").length,
          totalApps:   apps.length,
          pendingApps: apps.filter((a) => a.status === "bekliyor").length,
        });
      } else {
        const [seaRes, certRes] = await Promise.all([
          supabase.from("sea_service").select("id, ship_name, ship_type, rank, grt, sign_on_date, sign_off_date").eq("candidate_id", user!.id).order("sign_on_date", { ascending: false }),
          supabase.from("certificates").select("id, name, expiry_date").eq("candidate_id", user!.id),
        ]);
        setSea((seaRes.data ?? []) as SeaRecord[]);
        setCerts((certRes.data ?? []) as Certificate[]);
      }
      setDataLoading(false);
    }

    fetchData();
  }, [user]);

  /* Avatar upload */
  async function handleAvatarUpload(url: string) {
    setAvatarUrl(url);
    if (!user) return;
    const supabase  = createClient();
    const column    = user.role === "employer" ? "logo_url" : "avatar_url";
    const { error } = await supabase.from("profiles").update({ [column]: url || null }).eq("id", user.id);
    if (error) {
      setAvatarUrl(user.avatarUrl ?? "");
      console.error("Profil fotoğrafı kaydedilemedi:", error.message);
    } else {
      refreshUser();
    }
  }

  function setField<K extends keyof PersonalInfo>(key: K, val: PersonalInfo[K]) {
    setPersonal((p) => ({ ...p, [key]: val }));
    if (saveStatus !== "idle") setSaveStatus("idle");
  }

  async function updateProfile() {
    if (!user) return;
    setSaveStatus("saving");
    setSaveError("");
    const supabase = createClient();

    const payload = user.role === "employer"
      ? {
          full_name:  personal.companyName || null,
          city:       personal.city        || null,
          address:    personal.address     || null,
          tax_office: personal.taxOffice   || null,
          tax_no:     personal.taxNo       || null,
          website:    personal.website     || null,
        }
      : {
          seaman_book_no: personal.bookletNo   || null,
          birth_date:     personal.birthDate   || null,
          nationality:    personal.nationality || null,
          city:           personal.city        || null,
          address:        personal.address     || null,
        };

    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);

    if (error) {
      setSaveError(error.message);
      setSaveStatus("error");
    } else {
      setSaveStatus("success");
      refreshUser();
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  /* Profile completion */
  const { items: completionItems, pct: completionPct } = (!loading && user)
    ? calcCompletion(user.role, personal, user.phone, avatarUrl, sea, certs, employerStats)
    : { items: [], pct: 0 };

  /* Onboarding: show banner if profile incomplete (phone or avatar missing) */
  const showOnboarding = !loading && user && (!user.phone || !avatarUrl);

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">

      {/* ── Onboarding Banner ──────────────────────────────────────── */}
      {showOnboarding && <OnboardingBanner role={user!.role} />}

      {/* ── Welcome Header ─────────────────────────────────────────── */}
      {loading ? (
        <WelcomeSkeleton />
      ) : (
        <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <ImageUpload
                  currentUrl={avatarUrl || null}
                  folder={user?.id ?? ""}
                  onUpload={handleAvatarUpload}
                  variant={user?.role === "employer" ? "logo" : "avatar"}
                  placeholder={user?.initials ?? "?"}
                  size="w-14 h-14"
                  hideHint
                />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{t.welcome} ⚓</p>
                <h1 className="text-xl font-bold text-white">{user?.fullName ?? "Kullanıcı"}</h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  {formatRole(user?.role ?? "")}
                  {user?.email ? ` · ${user.email}` : ""}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl self-start sm:self-auto ${
              completionPct === 100
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-amber-500/10 border border-amber-500/20"
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${completionPct === 100 ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className={`text-xs font-semibold ${completionPct === 100 ? "text-emerald-400" : "text-amber-400"}`}>
                {completionPct === 100 ? "Profil Tam" : `%${completionPct} Tamamlandı`}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{t.profile_completion}</span>
              <span className="text-sm font-bold text-[#00D2FF]">%{completionPct}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00D2FF] to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
                role="progressbar" aria-valuenow={completionPct} aria-valuemin={0} aria-valuemax={100}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              {completionItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-600"}`}>
                    {item.done ? (
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </span>
                  <span className={`text-xs ${item.done ? "text-slate-300" : "text-slate-500"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Two Column Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT: Profil Formu — rol bazlı */}
        <div className="lg:col-span-3 bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6">
          <SectionTitle>
            {user?.role === "employer" ? "Şirket Bilgileri" : t.profile_heading}
          </SectionTitle>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={i >= 3 ? "sm:col-span-2" : ""}>
                  <Skeleton className="h-3 w-24 mb-2" /><Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : user?.role === "employer" ? (
            /* ── Employer Form ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <FieldLabel>Şirket Adı</FieldLabel>
                <DashInput value={personal.companyName} onChange={(v) => setField("companyName", v)} placeholder="Örn: Atlas Denizcilik A.Ş." />
              </div>
              <div>
                <FieldLabel>Vergi Dairesi</FieldLabel>
                <DashInput value={personal.taxOffice} onChange={(v) => setField("taxOffice", v)} placeholder="Kadıköy V.D." />
              </div>
              <div>
                <FieldLabel>Vergi Numarası</FieldLabel>
                <DashInput value={personal.taxNo} onChange={(v) => setField("taxNo", v)} placeholder="1234567890" />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Şirket Web Sitesi</FieldLabel>
                <DashInput value={personal.website} onChange={(v) => setField("website", v)} placeholder="https://sirketiniz.com.tr" />
              </div>
              <div>
                <FieldLabel>{t.city}</FieldLabel>
                <DashInput value={personal.city} onChange={(v) => setField("city", v)} placeholder="İstanbul" />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>Şirket Adresi</FieldLabel>
                <DashInput value={personal.address} onChange={(v) => setField("address", v)} placeholder="Mahalle, Semt, Şehir" />
              </div>
              {user?.phone && (
                <div className="sm:col-span-2">
                  <FieldLabel>Kayıtlı Telefon</FieldLabel>
                  <div className="flex items-center gap-2 w-full bg-[#0D1629] border border-slate-700/30 rounded-xl px-4 py-2.5 opacity-50">
                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75a.75.75 0 01.75.75v15a.75.75 0 01-.75.75h-9a.75.75 0 01-.75-.75v-15a.75.75 0 01.75-.75h9z" /></svg>
                    <span className="text-sm text-slate-400">{user.phone}</span>
                    <span className="ml-auto text-xs text-slate-600">Kayıt sırasında girildi</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Candidate Form ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel>{t.seaman_book}</FieldLabel>
                <DashInput value={personal.bookletNo} onChange={(v) => setField("bookletNo", v)} placeholder="TUR-2024-XXXXXX" />
              </div>
              <div>
                <FieldLabel>{t.birth_date}</FieldLabel>
                <DashInput type="date" value={personal.birthDate} onChange={(v) => setField("birthDate", v)} />
              </div>
              <div>
                <FieldLabel>{t.nationality}</FieldLabel>
                <div className="relative">
                  <select value={personal.nationality} onChange={(e) => setField("nationality", e.target.value)}
                    className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all pr-9">
                    {NATIONALITIES.map((n) => <option key={n}>{n}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <div>
                <FieldLabel>{t.city}</FieldLabel>
                <DashInput value={personal.city} onChange={(v) => setField("city", v)} placeholder="İstanbul" />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>{t.address}</FieldLabel>
                <DashInput value={personal.address} onChange={(v) => setField("address", v)} placeholder="Mahalle, Semt, Şehir" />
              </div>
              {user?.phone && (
                <div className="sm:col-span-2">
                  <FieldLabel>Kayıtlı Telefon</FieldLabel>
                  <div className="flex items-center gap-2 w-full bg-[#0D1629] border border-slate-700/30 rounded-xl px-4 py-2.5 opacity-50">
                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75a.75.75 0 01.75.75v15a.75.75 0 01-.75.75h-9a.75.75 0 01-.75-.75v-15a.75.75 0 01.75-.75h9z" /></svg>
                    <span className="text-sm text-slate-400">{user.phone}</span>
                    <span className="ml-auto text-xs text-slate-600">Kayıt sırasında girildi</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && (
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <SaveFeedback status={saveStatus} errorMsg={saveError} />
              <button onClick={updateProfile} disabled={saveStatus === "saving"}
                className="ml-auto bg-[#00D2FF] text-[#050B14] font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer whitespace-nowrap">
                {saveStatus === "saving" ? (
                  <><span className="w-4 h-4 border-2 border-[#050B14]/30 border-t-[#050B14] rounded-full animate-spin" />{t.saving}</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7l-4-4z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 3v4h4M9 13h6M9 17h4" /></svg>{t.save}</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Role-based panel */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {user?.role === "employer"
            ? <EmployerPanel stats={employerStats} loading={loading || dataLoading} />
            : <CandidatePanel sea={sea} certs={certs} loading={loading || dataLoading} />
          }
        </div>
      </div>

    </div>
  );
}
