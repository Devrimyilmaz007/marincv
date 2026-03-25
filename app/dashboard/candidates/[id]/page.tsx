"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { typeGradient } from "@/lib/vessel-data";

/* ── Types ──────────────────────────────────────────────────────────────── */
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

interface CandidateDetail {
  id:             string;
  full_name:      string;
  nationality:    string | null;
  city:           string | null;
  address:        string | null;
  phone:          string | null;
  seaman_book_no: string | null;
  birth_date:     string | null;
  sea_service:    SeaService[];
  certificates:   Certificate[];
}

/* ── Ship type gradient ──────────────────────────────────────────────────── */

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function daysBetween(from: string, to: string | null): number {
  return Math.max(0, Math.floor(((to ? new Date(to) : new Date()).getTime() - new Date(from).getTime()) / 86_400_000));
}

function formatDuration(days: number): string {
  const y = Math.floor(days / 365);
  const m = Math.floor((days % 365) / 30);
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

function latestRank(ss: SeaService[]): string {
  if (!ss.length) return "Belirtilmemiş";
  return [...ss].sort((a, b) => new Date(b.sign_on_date).getTime() - new Date(a.sign_on_date).getTime())[0].rank;
}

function certValidity(expiry: string | null): { label: string; color: "green" | "yellow" | "red" | "slate" } {
  if (!expiry) return { label: "Süresiz", color: "slate" };
  const diff = (new Date(expiry).getTime() - Date.now()) / 86_400_000;
  if (diff < 0)  return { label: "Süresi Dolmuş",    color: "red"    };
  if (diff < 90) return { label: "Yakında Dolacak",   color: "yellow" };
  return               { label: "Geçerli",             color: "green"  };
}

const CERT_STYLE: Record<string, string> = {
  green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  yellow: "bg-amber-500/10   text-amber-400   border-amber-500/20",
  red:    "bg-red-500/10     text-red-400     border-red-500/20",
  slate:  "bg-slate-700/40   text-slate-400   border-slate-600/40",
};

const CERT_DOT: Record<string, string> = {
  green: "bg-emerald-400", yellow: "bg-amber-400", red: "bg-red-400", slate: "bg-slate-500",
};

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDateShort(d: string | null): string {
  if (!d) return "Günümüz";
  return new Date(d).toLocaleDateString("tr-TR", { month: "short", year: "numeric" });
}

function calcAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 86_400_000));
  return `${age} yaşında`;
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-slate-700/50 ${className ?? ""}`} aria-hidden="true" />;
}

function PageSkeleton() {
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <Skeleton className="h-4 w-36 mb-8 rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">

        {/* Left skeleton */}
        <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6 animate-pulse">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-700/60" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-11 w-full rounded-xl mt-6" />
        </div>

        {/* Right skeleton */}
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
                <Skeleton className="h-3 w-20 mb-3" /><Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
          <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6">
            <Skeleton className="h-4 w-40 mb-5" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          </div>
          <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6">
            <Skeleton className="h-4 w-44 mb-5" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Not Found ───────────────────────────────────────────────────────────── */
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Aday Bulunamadı</h2>
      <p className="text-sm text-slate-400 mb-6 max-w-xs">Bu profile ait bir kayıt bulunamadı veya profil kaldırılmış olabilir.</p>
      <Link
        href="/dashboard/candidates"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm font-semibold hover:bg-violet-500/20 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        Aday Listesine Dön
      </Link>
    </div>
  );
}

/* ── Section Title ───────────────────────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
      <span className="w-1 h-4 rounded-full bg-violet-400 inline-block" />
      {children}
    </h2>
  );
}

/* ── Info Row ────────────────────────────────────────────────────────────── */
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
      <span className="text-slate-500 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-200 truncate">{value}</p>
      </div>
    </div>
  );
}

/* ── Left Column ─────────────────────────────────────────────────────────── */
function ProfileSidebar({ candidate, rank }: { candidate: CandidateDetail; rank: string }) {
  const initials   = getInitials(candidate.full_name);
  const validCerts = candidate.certificates.filter(
    (c) => !c.expiry_date || new Date(c.expiry_date).getTime() > Date.now()
  ).length;

  return (
    <div className="lg:sticky lg:top-6 flex flex-col gap-4">

      {/* Back button */}
      <Link
        href="/dashboard/candidates"
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-violet-300 transition-colors w-fit"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Aday Listesine Dön
      </Link>

      {/* Profile card */}
      <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6 flex flex-col gap-5">

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-400 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-violet-500/20">
            {initials}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">{candidate.full_name}</h1>
            <p className="text-sm text-violet-300 mt-0.5">{rank}</p>
          </div>

          {/* Cert summary pill */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            validCerts > 0
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-slate-700/40 text-slate-400 border-slate-600/40"
          }`}>
            {validCerts > 0
              ? <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>{validCerts} Geçerli Belge</>
              : "Belge Girilmemiş"
            }
          </div>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-2">
          {candidate.phone && (
            <InfoRow
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-1.243.975-2.25 2.177-2.25h1.012c.757 0 1.41.49 1.624 1.197l.73 2.433a1.687 1.687 0 01-.422 1.716L6 11.087c.8 1.466 2.447 3.113 3.913 3.913l1.553-1.37a1.687 1.687 0 011.716-.423l2.433.73c.707.214 1.197.867 1.197 1.624v1.012c0 1.202-1.007 2.177-2.25 2.177-7.727 0-13.5-5.773-13.5-13.5z" /></svg>}
              label="Telefon"
              value={candidate.phone}
            />
          )}
          {candidate.nationality && (
            <InfoRow
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>}
              label="Uyruk"
              value={candidate.nationality}
            />
          )}
          {candidate.city && (
            <InfoRow
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>}
              label="Şehir"
              value={candidate.city}
            />
          )}
          {candidate.seaman_book_no && (
            <InfoRow
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
              label="Cüzdan / Kitap No"
              value={candidate.seaman_book_no}
            />
          )}
          {candidate.birth_date && (
            <InfoRow
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>}
              label="Doğum Tarihi"
              value={`${fmtDate(candidate.birth_date)} · ${calcAge(candidate.birth_date)}`}
            />
          )}
        </div>

        {/* CTA */}
        <button className="w-full py-3 rounded-xl bg-violet-500 text-white font-semibold text-sm hover:bg-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          İletişime Geç
        </button>
      </div>
    </div>
  );
}

/* ── Stats Grid ──────────────────────────────────────────────────────────── */
function StatsGrid({ candidate }: { candidate: CandidateDetail }) {
  const ss       = candidate.sea_service;
  const maxGRT   = highestGRT(ss);
  const uniqueTypes = [...new Set(ss.map((r) => r.ship_type))].length;

  const stats = [
    {
      label: "Toplam Deniz Hizmeti",
      value: ss.length ? calcTotalService(ss) : "—",
      accent: true,
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "En Yüksek GRT",
      value: maxGRT > 0 ? maxGRT.toLocaleString("tr-TR") : "—",
      accent: false,
      icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5",
    },
    {
      label: "Farklı Gemi Tipi",
      value: uniqueTypes > 0 ? `${uniqueTypes} Tip` : "—",
      accent: false,
      icon: "M12 3v1m0 0C9.5 4 7.5 5.5 7.5 8v1H5l-2 7h18l-2-7h-2.5V8C16.5 5.5 14.5 4 12 4zm-9 16c1.5 1.5 4 1.5 5.5 0S12 17.5 13.5 19s4 1.5 5.5 0",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 hover:border-violet-500/20 transition-colors">
          <div className="flex items-center gap-1.5 mb-3">
            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
            </svg>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{s.label}</p>
          </div>
          <p className={`text-xl font-bold ${s.accent ? "text-violet-300" : "text-white"}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Certificates Section ────────────────────────────────────────────────── */
function CertificatesSection({ certs }: { certs: Certificate[] }) {
  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <SectionTitle>STCW ve Mesleki Belgeler</SectionTitle>
        <span className="text-xs text-slate-500">{certs.length} belge</span>
      </div>

      {certs.length === 0 ? (
        <p className="text-sm text-slate-600 italic text-center py-6">Henüz belge girilmemiş.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certs.map((cert) => {
            const v = certValidity(cert.expiry_date);
            return (
              <div key={cert.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${CERT_STYLE[v.color].replace("text-", "border-").replace(/border-[^ ]+/, "")}`}
                style={{ background: "transparent" }}
              >
                <div className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${CERT_DOT[v.color]} mt-2`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-slate-200 leading-relaxed">{cert.name}</p>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${CERT_STYLE[v.color]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${CERT_DOT[v.color]}`} />
                      {v.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-xs text-slate-500">Veriliş: {fmtDate(cert.issue_date)}</p>
                    {cert.expiry_date && (
                      <>
                        <span className="text-slate-700">·</span>
                        <p className={`text-xs font-medium ${v.color === "red" ? "text-red-400" : v.color === "yellow" ? "text-amber-400" : "text-slate-500"}`}>
                          Son: {fmtDate(cert.expiry_date)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Sea Service Timeline ────────────────────────────────────────────────── */
function SeaServiceTimeline({ records }: { records: SeaService[] }) {
  const sorted = [...records].sort(
    (a, b) => new Date(b.sign_on_date).getTime() - new Date(a.sign_on_date).getTime()
  );

  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Deniz Hizmet Geçmişi</SectionTitle>
        <span className="text-xs text-slate-500">{records.length} görev</span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-600 italic text-center py-6">Henüz deniz hizmeti girilmemiş.</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/40 via-slate-700/60 to-transparent" aria-hidden="true" />

          <div className="flex flex-col gap-0">
            {sorted.map((r, idx) => {
              const isOnboard  = !r.sign_off_date;
              const duration   = formatDuration(daysBetween(r.sign_on_date, r.sign_off_date));
              const gradient   = typeGradient(r.ship_type);
              const isLast     = idx === sorted.length - 1;

              return (
                <div key={r.id} className={`relative pl-12 ${isLast ? "pb-0" : "pb-6"}`}>

                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-4 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md z-10`}>
                    <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 0C9.5 4 7.5 5.5 7.5 8v1H5l-2 7h18l-2-7h-2.5V8C16.5 5.5 14.5 4 12 4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 19c1.5 1.5 4 1.5 5.5 0S12 17.5 13.5 19s4 1.5 5.5 0" />
                    </svg>
                  </div>

                  {/* Card */}
                  <div className="bg-[#0D1629] border border-slate-700/40 rounded-2xl p-4 hover:border-slate-600/60 transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-white">{r.ship_name}</p>
                          {isOnboard && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-[#00D2FF] text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-pulse" />
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-violet-300 mt-0.5 font-medium">{r.rank}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-white">{duration}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {fmtDateShort(r.sign_on_date)} — {fmtDateShort(r.sign_off_date)}
                        </p>
                      </div>
                    </div>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${gradient} shadow-sm`}>
                        {r.ship_type}
                      </span>
                      {r.grt && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-[#00D2FF] text-xs font-medium">
                          {r.grt.toLocaleString("tr-TR")} GRT
                        </span>
                      )}
                      {r.kw && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs">
                          {r.kw.toLocaleString("tr-TR")} kW
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function CandidateDetailPage() {
  const { id }                        = useParams<{ id: string }>();
  const [candidate, setCandidate]     = useState<CandidateDetail | null>(null);
  const [loading,   setLoading]       = useState(true);
  const [notFound,  setNotFound]      = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, nationality, city, address, phone, seaman_book_no, birth_date, sea_service(*), certificates(*)")
        .eq("id", id)
        .single();

      if (!cancelled) {
        if (error || !data) {
          setNotFound(true);
        } else {
          setCandidate(data as unknown as CandidateDetail);
        }
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <PageSkeleton />;
  if (notFound || !candidate) return <NotFound />;

  const rank = latestRank(candidate.sea_service);

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

        {/* LEFT — Sticky Sidebar */}
        <ProfileSidebar candidate={candidate} rank={rank} />

        {/* RIGHT — Scrollable CV content */}
        <div className="flex flex-col gap-6">
          <StatsGrid candidate={candidate} />
          <CertificatesSection certs={candidate.certificates} />
          <SeaServiceTimeline records={candidate.sea_service} />
        </div>
      </div>
    </div>
  );
}
