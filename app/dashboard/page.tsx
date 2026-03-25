"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useDashUser } from "./_context";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface PersonalInfo {
  bookletNo:   string;
  birthDate:   string;
  nationality: string;
  city:        string;
  address:     string;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

/* ── Static Data ─────────────────────────────────────────────────────────── */
const SEA_SERVICE = {
  vesselTypes:     ["Kimyasal Tanker", "Kuru Yük", "Ro-Ro"],
  totalExperience: "8 Yıl 4 Ay",
  grtExperience:   "150.000+",
  lastVessel:      "MT BOSPHORUS STAR",
  lastCompany:     "Atlas Denizcilik A.Ş.",
};

const COMPLETION_ITEMS = [
  { label: "Kişisel Bilgiler",    done: true  },
  { label: "STCW Belgeleri",      done: true  },
  { label: "Mesleki Geçmiş",      done: true  },
  { label: "Referans Mektupları", done: false },
  { label: "Profil Fotoğrafı",    done: false },
  { label: "Liman Devleti",       done: false },
];

const PROFILE_COMPLETION = 50;

const DOCUMENTS = [
  { name: "STCW 2010 Temel Güvenlik",  expiry: "2027-03-15", verified: true  },
  { name: "C1/D Vizesi",                expiry: "2025-11-01", verified: true  },
  { name: "Tanker Familiarization",     expiry: "2026-08-20", verified: true  },
  { name: "GMDSS GOC Belgesi",          expiry: null,         verified: false },
  { name: "ECDIS Type Specific",        expiry: null,         verified: false },
  { name: "İleri Yangın Söndürme",      expiry: null,         verified: false },
];

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

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded-lg bg-slate-700/50 ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

/* ── Field Label ─────────────────────────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">
      {children}
    </label>
  );
}

/* ── Dashboard Input ─────────────────────────────────────────────────────── */
function DashInput({
  value, onChange, placeholder, type = "text", disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    />
  );
}

/* ── Stat Card ───────────────────────────────────────────────────────────── */
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

/* ── Section Title ───────────────────────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
      <span className="w-1 h-4 rounded-full bg-[#00D2FF] inline-block" />
      {children}
    </h2>
  );
}

/* ── Welcome Skeleton ────────────────────────────────────────────────────── */
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

/* ── Save Status Feedback ────────────────────────────────────────────────── */
function SaveFeedback({ status, errorMsg }: { status: SaveStatus; errorMsg: string }) {
  if (status === "success") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {t.success_saved}
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        {errorMsg}
      </div>
    );
  }
  return null;
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, loading, dict } = useDashUser();
  const t = dict.dashboard;

  const [personal, setPersonal] = useState<PersonalInfo>({
    bookletNo:   "",
    birthDate:   "",
    nationality: "Türkiye",
    city:        "",
    address:     "",
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError,  setSaveError]  = useState("");

  /* Supabase'den gelen verilerle formu doldur */
  useEffect(() => {
    if (!user) return;
    setPersonal({
      bookletNo:   user.seamanBookNo,
      birthDate:   user.birthDate,
      nationality: user.nationality || "Türkiye",
      city:        user.city,
      address:     user.address,
    });
  }, [user]);

  function setField<K extends keyof PersonalInfo>(key: K, val: PersonalInfo[K]) {
    setPersonal((p) => ({ ...p, [key]: val }));
    if (saveStatus !== "idle") setSaveStatus("idle");
  }

  async function updateProfile() {
    if (!user) return;
    setSaveStatus("saving");
    setSaveError("");

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        seaman_book_no: personal.bookletNo  || null,
        birth_date:     personal.birthDate  || null,
        nationality:    personal.nationality || null,
        city:           personal.city       || null,
        address:        personal.address    || null,
      })
      .eq("id", user.id);

    if (error) {
      setSaveError(error.message);
      setSaveStatus("error");
    } else {
      setSaveStatus("success");
      /* 4 saniye sonra feedback'i gizle */
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-8">

      {/* ── Welcome Header ─────────────────────────────────────────── */}
      {loading ? (
        <WelcomeSkeleton />
      ) : (
        <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-[#00D2FF] flex items-center justify-center text-white font-black text-lg shrink-0">
                {user?.initials ?? "?"}
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
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">Profil Aktif</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{t.profile_completion}</span>
              <span className="text-sm font-bold text-[#00D2FF]">%{PROFILE_COMPLETION}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00D2FF] to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${PROFILE_COMPLETION}%` }}
                role="progressbar"
                aria-valuenow={PROFILE_COMPLETION}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              {COMPLETION_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-600"}`}>
                    {item.done ? (
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-xs ${item.done ? "text-slate-300" : "text-slate-500"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Two Column Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT: Kişisel Bilgiler (3/5) */}
        <div className="lg:col-span-3 bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6">
          <SectionTitle>{t.profile_heading}</SectionTitle>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={i >= 3 ? "sm:col-span-2" : ""}>
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <FieldLabel>{t.seaman_book}</FieldLabel>
                <DashInput
                  value={personal.bookletNo}
                  onChange={(v) => setField("bookletNo", v)}
                  placeholder="TUR-2024-XXXXXX"
                />
              </div>

              <div>
                <FieldLabel>{t.birth_date}</FieldLabel>
                <DashInput
                  type="date"
                  value={personal.birthDate}
                  onChange={(v) => setField("birthDate", v)}
                />
              </div>

              <div>
                <FieldLabel>{t.nationality}</FieldLabel>
                <div className="relative">
                  <select
                    value={personal.nationality}
                    onChange={(e) => setField("nationality", e.target.value)}
                    className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all pr-9"
                  >
                    {NATIONALITIES.map((n) => <option key={n}>{n}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <FieldLabel>{t.city}</FieldLabel>
                <DashInput
                  value={personal.city}
                  onChange={(v) => setField("city", v)}
                  placeholder="İstanbul"
                />
              </div>

              <div className="sm:col-span-2">
                <FieldLabel>{t.address}</FieldLabel>
                <DashInput
                  value={personal.address}
                  onChange={(v) => setField("address", v)}
                  placeholder="Mahalle, Semt, Şehir"
                />
              </div>

              {/* Telefon — sadece gösterim (kayıttan geliyor) */}
              {user?.phone && (
                <div className="sm:col-span-2">
                  <FieldLabel>Kayıtlı Telefon</FieldLabel>
                  <div className="flex items-center gap-2 w-full bg-[#0D1629] border border-slate-700/30 rounded-xl px-4 py-2.5 opacity-50">
                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75a.75.75 0 01.75.75v15a.75.75 0 01-.75.75h-9a.75.75 0 01-.75-.75v-15a.75.75 0 01.75-.75h9z" />
                    </svg>
                    <span className="text-sm text-slate-400">{user.phone}</span>
                    <span className="ml-auto text-xs text-slate-600">Kayıt sırasında girildi</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save footer */}
          {!loading && (
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <SaveFeedback status={saveStatus} errorMsg={saveError} />

              <button
                onClick={updateProfile}
                disabled={saveStatus === "saving"}
                className="ml-auto bg-[#00D2FF] text-[#050B14] font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                {saveStatus === "saving" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#050B14]/30 border-t-[#050B14] rounded-full animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7l-4-4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 3v4h4M9 13h6M9 17h4" />
                    </svg>
                    {t.save}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Mesleki Özet (2/5) */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {loading ? (
            <div className="flex flex-col gap-5 animate-pulse">
              <div className="grid grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
                    <Skeleton className="h-3 w-24 mb-3" />
                    <Skeleton className="h-7 w-20" />
                  </div>
                ))}
              </div>
              <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
                <Skeleton className="h-3 w-28 mb-4" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <StatCard label={t.total_service} value={SEA_SERVICE.totalExperience} accent />
                <StatCard label={t.vessel_experience} value={SEA_SERVICE.grtExperience} sub="GRT" />
              </div>

              {/* Rank */}
              <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-colors">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">{t.current_rank}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#00D2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{formatRole(user?.role ?? "")}</p>
                    <p className="text-xs text-slate-500">STCW 2010 Onaylı</p>
                  </div>
                </div>
              </div>

              {/* Vessel Types */}
              <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-colors flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">{t.vessel_experience}</p>
                <div className="flex flex-wrap gap-2">
                  {SEA_SERVICE.vesselTypes.map((t) => (
                    <span key={t} className="px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 text-xs border border-slate-700/60 hover:border-[#00D2FF]/30 hover:text-[#00D2FF] transition-colors">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Son Görev Gemisi</span>
                    <span className="text-xs font-semibold text-slate-300">{SEA_SERVICE.lastVessel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Son Şirket</span>
                    <span className="text-xs font-semibold text-slate-300">{SEA_SERVICE.lastCompany}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Hızlı Aksiyonlar</p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard/my-cv"
                    className="w-full text-left flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-[#00D2FF]/30 transition-all group cursor-pointer"
                  >
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">CV Önizleme</span>
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-[#00D2FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </Link>
                  <Link
                    href="/dashboard/my-cv?print=true"
                    className="w-full text-left flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-[#00D2FF]/30 transition-all group cursor-pointer"
                  >
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">CV İndir (PDF)</span>
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-[#00D2FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Verified Documents Strip ────────────────────────────────── */}
      <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <SectionTitle>Doğrulanmış Belgeler</SectionTitle>
          <span className="text-xs text-slate-500">3 / 6 onaylı</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {DOCUMENTS.map((doc) => (
            <div
              key={doc.name}
              className={[
                "flex items-start gap-3 p-4 rounded-xl border transition-colors",
                doc.verified
                  ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                  : "bg-slate-800/30 border-slate-700/40 hover:border-slate-600/60",
              ].join(" ")}
            >
              <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${doc.verified ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-500"}`}>
                {doc.verified ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-semibold truncate ${doc.verified ? "text-slate-200" : "text-slate-500"}`}>
                  {doc.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {doc.verified && doc.expiry ? `Geçerlilik: ${doc.expiry}` : doc.verified ? "Süresiz" : "Belge Yüklenmedi"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
