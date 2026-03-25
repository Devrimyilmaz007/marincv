"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Profile {
  full_name:      string;
  email:          string | null;
  phone:          string | null;
  city:           string | null;
  nationality:    string | null;
  seaman_book_no: string | null;
  birth_date:     string | null;
  role:           string | null;
}

interface SeaService {
  id:            string;
  ship_name:     string;
  ship_type:     string;
  grt:           number | null;
  kw:            number | null;
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

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function fmtDateShort(d: string | null): string {
  if (!d) return "Devam";
  return new Date(d).toLocaleDateString("tr-TR", { month: "short", year: "numeric" });
}

function daysBetween(from: string, to: string | null): number {
  return Math.max(0, Math.floor(
    (((to ? new Date(to) : new Date()).getTime()) - new Date(from).getTime()) / 86_400_000
  ));
}

function formatDuration(days: number): string {
  const y = Math.floor(days / 365);
  const m = Math.floor((days % 365) / 30);
  if (y === 0 && m === 0) return "< 1 Ay";
  if (y === 0) return `${m} Ay`;
  if (m === 0) return `${y} Yıl`;
  return `${y} Yıl ${m} Ay`;
}

function certStatus(expiry: string | null): { label: string; cls: string } {
  if (!expiry) return { label: "Süresiz", cls: "text-slate-500" };
  const diff = (new Date(expiry).getTime() - Date.now()) / 86_400_000;
  if (diff < 0)  return { label: "Süresi Dolmuş", cls: "text-red-600 font-semibold" };
  if (diff < 90) return { label: "Yakında Dolacak", cls: "text-amber-600 font-semibold" };
  return { label: "Geçerli", cls: "text-emerald-600" };
}

/* ── Auto-print trigger ──────────────────────────────────────────────────── */
function AutoPrint() {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("print") === "true") {
      const timer = setTimeout(() => window.print(), 600);
      return () => clearTimeout(timer);
    }
  }, [params]);
  return null;
}

/* ── CV Content ──────────────────────────────────────────────────────────── */
function CVContent() {
  const router = useRouter();

  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [service,  setService]  = useState<SeaService[]>([]);
  const [certs,    setCerts]    = useState<Certificate[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authUser) {
      setError("Oturum bulunamadı. Lütfen giriş yapın.");
      setLoading(false);
      return;
    }

    const [profileRes, serviceRes, certsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, phone, city, nationality, seaman_book_no, birth_date, role")
        .eq("id", authUser.id)
        .maybeSingle(),
      supabase
        .from("sea_service")
        .select("id, ship_name, ship_type, grt, kw, rank, sign_on_date, sign_off_date")
        .eq("profile_id", authUser.id)
        .order("sign_on_date", { ascending: false }),
      supabase
        .from("certificates")
        .select("id, name, issue_date, expiry_date")
        .eq("profile_id", authUser.id)
        .order("issue_date", { ascending: false }),
    ]);

    if (profileRes.error) {
      setError("Profil yüklenemedi: " + profileRes.error.message);
    } else {
      setProfile(profileRes.data ? { ...profileRes.data, email: authUser.email ?? null } : null);
      setService((serviceRes.data ?? []) as SeaService[]);
      setCerts((certsRes.data ?? []) as Certificate[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalDays = service.reduce((acc, r) => acc + daysBetween(r.sign_on_date, r.sign_off_date), 0);

  /* En güncel hizmet kaydından rütbeyi al */
  const currentRank = [...service]
    .sort((a, b) => new Date(b.sign_on_date).getTime() - new Date(a.sign_on_date).getTime())[0]
    ?.rank ?? "Rütbe Girilmedi";

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
          <p className="text-sm">CV hazırlanıyor…</p>
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const name = profile?.full_name ?? "—";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">

      {/* ── Toolbar (print:hidden) ────────────────────────────────────── */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Geri Dön
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:block">
              Tarayıcınızın PDF kaydet seçeneğini kullanın
            </span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-slate-900 text-white hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              PDF Olarak Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* ── CV Document ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-10 print:p-0 print:max-w-none">
        <div className="bg-white shadow-sm print:shadow-none rounded-2xl print:rounded-none overflow-hidden">

          {/* ── CV Header ─────────────────────────────────────────────── */}
          <div className="bg-slate-900 print:bg-slate-900 px-10 py-8 text-white">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="shrink-0 w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black text-white">
                {initials}
              </div>

              {/* Name & Role */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
                  {name}
                </h1>
                <p className="text-slate-300 font-medium mt-1">
                  {currentRank}
                </p>

                {/* Contact chips */}
                <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-3">
                  {profile?.email && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                      {profile.email}
                    </span>
                  )}
                  {profile?.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                      {profile.phone}
                    </span>
                  )}
                  {profile?.city && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                      {profile.city}{profile?.nationality ? `, ${profile.nationality}` : ""}
                    </span>
                  )}
                  {profile?.seaman_book_no && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>
                      Cüzdan: {profile.seaman_book_no}
                    </span>
                  )}
                  {profile?.birth_date && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-400">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>
                      D.T. {fmtDate(profile.birth_date)}
                    </span>
                  )}
                </div>
              </div>

              {/* Total service badge */}
              {totalDays > 0 && (
                <div className="shrink-0 text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Toplam Deniz Hizmeti</p>
                  <p className="text-2xl font-black text-white">{formatDuration(totalDays)}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── CV Body ───────────────────────────────────────────────── */}
          <div className="px-10 py-8 space-y-10">

            {/* ── Sea Service ─────────────────────────────────────────── */}
            <section>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="flex-1 h-px bg-slate-200" />
                Deniz Hizmeti Geçmişi
                <span className="flex-1 h-px bg-slate-200" />
              </h2>

              {service.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-4">
                  Henüz deniz hizmeti kaydı bulunmuyor.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border border-slate-200">
                        <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Gemi Adı</th>
                        <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Gemi Tipi</th>
                        <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Rütbe</th>
                        <th className="text-right px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">GRT</th>
                        <th className="text-center px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Katılış</th>
                        <th className="text-center px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Ayrılış</th>
                        <th className="text-right px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Süre</th>
                      </tr>
                    </thead>
                    <tbody>
                      {service.map((r, i) => {
                        const duration = formatDuration(daysBetween(r.sign_on_date, r.sign_off_date));
                        const isOnboard = !r.sign_off_date;
                        return (
                          <tr
                            key={r.id}
                            className={`border-b border-slate-100 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} ${isOnboard ? "bg-blue-50/50" : ""}`}
                          >
                            <td className="px-4 py-3 font-semibold text-slate-900">{r.ship_name}</td>
                            <td className="px-4 py-3 text-slate-600">{r.ship_type}</td>
                            <td className="px-4 py-3 text-slate-700">{r.rank}</td>
                            <td className="px-4 py-3 text-right font-mono text-slate-600 tabular-nums">
                              {r.grt ? r.grt.toLocaleString("tr-TR") : "—"}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-500">{fmtDateShort(r.sign_on_date)}</td>
                            <td className="px-4 py-3 text-center">
                              {isOnboard
                                ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse print:animate-none" />Aktif</span>
                                : <span className="text-slate-500">{fmtDateShort(r.sign_off_date)}</span>
                              }
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-700">{duration}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {service.length > 1 && (
                      <tfoot>
                        <tr className="bg-slate-100 border-t-2 border-slate-300">
                          <td colSpan={6} className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Toplam Deniz Hizmeti</td>
                          <td className="px-4 py-2.5 text-right font-black text-slate-900">{formatDuration(totalDays)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </section>

            {/* ── Certificates ────────────────────────────────────────── */}
            <section>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="flex-1 h-px bg-slate-200" />
                STCW ve Mesleki Belgeler
                <span className="flex-1 h-px bg-slate-200" />
              </h2>

              {certs.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-4">
                  Henüz belge kaydı bulunmuyor.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {certs.map((c) => {
                    const status = certStatus(c.expiry_date);
                    return (
                      <div
                        key={c.id}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white"
                      >
                        {/* Status dot */}
                        <div className={`shrink-0 mt-0.5 w-2 h-2 rounded-full ${
                          c.expiry_date === null ? "bg-slate-400" :
                          (new Date(c.expiry_date).getTime() - Date.now()) / 86_400_000 < 0
                            ? "bg-red-500"
                            : (new Date(c.expiry_date).getTime() - Date.now()) / 86_400_000 < 90
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 leading-snug">{c.name}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="text-xs text-slate-400">
                              Veriliş: {fmtDate(c.issue_date)}
                            </span>
                            <span className={`text-xs ${status.cls}`}>
                              {c.expiry_date ? `Geçerlilik: ${fmtDate(c.expiry_date)}` : status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <footer className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                MarinCV platformu üzerinden oluşturulmuştur · marincv.com
              </p>
              <p className="text-xs text-slate-400">
                {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </footer>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page (Suspense wrapper for useSearchParams) ─────────────────────────── */
export default function MyCVPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AutoPrint />
      </Suspense>
      <CVContent />
    </>
  );
}
