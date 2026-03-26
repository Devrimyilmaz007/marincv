"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDashUser } from "../_context";
import { SHIP_TYPES, RANK_PRESETS, typeGradient } from "@/lib/vessel-data";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface JobPosting {
  id:                string;
  employer_id:       string;
  title:             string;
  vessel_type:       string;
  rank_req:          string;
  grt_req:           number | null;
  contract_duration: string;
  status:            "active" | "closed";
  created_at?:       string;
}

interface JobForm {
  title:            string;
  vesselType:       string;
  rankReq:          string;
  customRank:       string;
  grtReq:           string;
  contractDuration: string;
}

interface ToastMsg {
  type:    "success" | "error";
  message: string;
}


const CONTRACT_SUGGESTIONS = [
  "3 Ay", "4 Ay", "4+1 Ay", "6 Ay", "6+2 Ay", "8 Ay", "12 Ay", "Belirsiz Süreli",
];

const EMPTY_FORM: JobForm = {
  title:            "",
  vesselType:       "",
  rankReq:          "",
  customRank:       "",
  grtReq:           "",
  contractDuration: "",
};


/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtDate(d: string | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Primitives ──────────────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-slate-700/50 ${className ?? ""}`} aria-hidden="true" />;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">{children}</label>;
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text" value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10 transition-all"
    />
  );
}

function NumberInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="number" value={value} min={0}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

function SelectInput({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10 transition-all pr-9"
      >
        {children}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ toast, onDismiss }: { toast: ToastMsg; onDismiss: () => void }) {
  const ok = toast.type === "success";
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl text-sm font-medium backdrop-blur-xl
        ${ok ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/90     border-red-500/30     text-red-300"}`}
    >
      {ok
        ? <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
      }
      {toast.message}
      <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Kapat">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

/* ── Add Modal ───────────────────────────────────────────────────────────── */
function AddModal({ onClose, onSave, saving }: { onClose: () => void; onSave: (f: JobForm) => Promise<void>; saving: boolean }) {
  const [form,   setForm]   = useState<JobForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof JobForm, string>>>({});
  const isCustomRank = form.rankReq === "Diğer...";

  function set<K extends keyof JobForm>(k: K, v: JobForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof JobForm, string>> = {};
    if (!form.title.trim())            e.title            = "İlan başlığı zorunludur.";
    if (!form.vesselType)              e.vesselType       = "Gemi tipi seçiniz.";
    const rank = isCustomRank ? form.customRank : form.rankReq;
    if (!rank.trim())                  e.rankReq          = "İstenen rütbe zorunludur.";
    if (!form.contractDuration.trim()) e.contractDuration = "Kontrat süresi zorunludur.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0B1221] border border-slate-700/60 rounded-2xl shadow-2xl p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-white">Yeni İlan Ekle</h2>
            <p className="text-xs text-slate-400 mt-0.5">İlan bilgilerini eksiksiz doldurun.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1" aria-label="Kapat">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          {/* Title */}
          <div>
            <Label>İlan Başlığı</Label>
            <TextInput value={form.title} onChange={(v) => set("title", v)} placeholder="Acil Uzakyol Kaptanı Aranıyor" />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
          </div>

          {/* Vessel + Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>İstenen Gemi Tipi</Label>
              <SelectInput value={form.vesselType} onChange={(v) => set("vesselType", v)}>
                <option value="">— Tip seçin —</option>
                {SHIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </SelectInput>
              {errors.vesselType && <p className="mt-1 text-xs text-red-400">{errors.vesselType}</p>}
            </div>
            <div>
              <Label>İstenen Rütbe</Label>
              <SelectInput value={form.rankReq} onChange={(v) => set("rankReq", v)}>
                <option value="">— Rütbe seçin —</option>
                {RANK_PRESETS.map((r) => <option key={r} value={r}>{r}</option>)}
              </SelectInput>
              {isCustomRank && (
                <input
                  type="text" value={form.customRank}
                  onChange={(e) => set("customRank", e.target.value)}
                  placeholder="Rütbeyi yazın…" autoFocus
                  className="mt-2 w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10 transition-all"
                />
              )}
              {errors.rankReq && <p className="mt-1 text-xs text-red-400">{errors.rankReq}</p>}
            </div>
          </div>

          {/* GRT + Contract */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Min. GRT Tecrübesi <span className="normal-case text-slate-600 ml-1">opsiyonel</span></Label>
              <NumberInput value={form.grtReq} onChange={(v) => set("grtReq", v)} placeholder="50000" />
            </div>
            <div>
              <Label>Kontrat Süresi</Label>
              <TextInput value={form.contractDuration} onChange={(v) => set("contractDuration", v)} placeholder="4+1 Ay" />
              {/* Quick picks */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {CONTRACT_SUGGESTIONS.map((s) => (
                  <button
                    key={s} type="button"
                    onClick={() => set("contractDuration", s)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                      form.contractDuration === s
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.contractDuration && <p className="mt-1 text-xs text-red-400">{errors.contractDuration}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 mt-1 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
              İptal
            </button>
            <button
              type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-violet-500 text-white hover:bg-violet-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Yayınlanıyor…</>
                : "İlanı Yayınla"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Status Badge ────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: "active" | "closed" }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 border border-slate-600/40 text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      Kapalı
    </span>
  );
}

/* ── Job Card ────────────────────────────────────────────────────────────── */
function JobCard({
  job,
  onDelete,
  onToggleStatus,
}: {
  job:            JobPosting;
  onDelete:       (id: string) => Promise<void>;
  onToggleStatus: (id: string, current: "active" | "closed") => Promise<void>;
}) {
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const gradient = typeGradient(job.vessel_type);

  async function handleDelete() {
    setDeleting(true);
    await onDelete(job.id);
    setDeleting(false);
    setConfirmDelete(false);
  }

  async function handleToggle() {
    setTogglingStatus(true);
    await onToggleStatus(job.id, job.status);
    setTogglingStatus(false);
  }

  return (
    <div className={`bg-[#0B1221] border rounded-2xl p-5 transition-colors group ${
      job.status === "closed" ? "border-slate-800/40 opacity-70" : "border-slate-700/40 hover:border-slate-600/60"
    }`}>
      <div className="flex items-start gap-4">

        {/* Vessel type icon */}
        <div className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={job.status} />
              <span className="text-xs text-slate-500">{fmtDate(job.created_at)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Status Toggle */}
              <button
                onClick={handleToggle}
                disabled={togglingStatus}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
                  job.status === "active"
                    ? "bg-slate-800/60 text-slate-400 border-slate-700/40 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
                aria-label={job.status === "active" ? "İlanı kapat" : "İlanı aktifleştir"}
              >
                {togglingStatus ? "…" : job.status === "active" ? "Kapat" : "Aktifleştir"}
              </button>

              {/* Delete */}
              {confirmDelete ? (
                <>
                  <span className="text-xs text-slate-400 hidden sm:block">Emin misin?</span>
                  <button
                    onClick={handleDelete} disabled={deleting}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {deleting ? "…" : "Sil"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
                  >
                    Vazgeç
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                  aria-label="İlanı sil"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <p className="text-sm font-bold text-white mb-1">{job.title}</p>

          {/* Detail chips */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-300">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 0C9.5 4 7.5 5.5 7.5 8v1H5l-2 7h18l-2-7h-2.5V8C16.5 5.5 14.5 4 12 4z" /></svg>
              {job.vessel_type}
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-300">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
              {job.rank_req}
            </span>
            {job.grt_req && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                Min. {job.grt_req.toLocaleString("tr-TR")} GRT
              </span>
            )}
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-300">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {job.contract_duration}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-white mb-2">Henüz ilan açılmamış</h3>
      <p className="text-sm text-slate-400 max-w-xs mb-6">
        İlk iş ilanınızı açarak sertifikalı denizcilere ulaşmaya başlayın.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm font-semibold hover:bg-violet-500/20 transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        İlk İlanı Aç
      </button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function JobsPage() {
  const { user, loading: userLoading, dict } = useDashUser();
  const t = dict.dashboard;

  const [jobs,        setJobs]        = useState<JobPosting[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState<ToastMsg | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Fetch ─────────────────────────────────────────────────────────── */
  const fetchJobs = useCallback(async (userId: string) => {
    setListLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("job_postings")
      .select("*")
      .eq("employer_id", userId)
      .order("created_at", { ascending: false });

    if (error) setToast({ type: "error", message: "İlanlar yüklenirken bir hata oluştu." });
    else setJobs(data ?? []);
    setListLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id) fetchJobs(user.id);
  }, [user?.id, fetchJobs]);

  /* ── Insert ─────────────────────────────────────────────────────────── */
  async function handleSave(form: JobForm): Promise<void> {
    if (!user) return;
    setSaving(true);

    const rank = form.rankReq === "Diğer..." ? form.customRank : form.rankReq;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("job_postings")
      .insert({
        employer_id:       user.id,
        title:             form.title,
        vessel_type:       form.vesselType,
        rank_req:          rank,
        grt_req:           form.grtReq ? parseInt(form.grtReq, 10) : null,
        contract_duration: form.contractDuration,
        status:            "active",
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      setToast({ type: "error", message: error.message });
    } else {
      setJobs((prev) => [data, ...prev]);
      setShowModal(false);
      setToast({ type: "success", message: `"${form.title}" ilanı yayınlandı.` });
    }
  }

  /* ── Toggle Status ──────────────────────────────────────────────────── */
  async function handleToggleStatus(id: string, current: "active" | "closed"): Promise<void> {
    const next     = current === "active" ? "closed" : "active";
    const supabase = createClient();
    const { error } = await supabase
      .from("job_postings")
      .update({ status: next })
      .eq("id", id);

    if (error) {
      setToast({ type: "error", message: "Durum güncellenirken bir hata oluştu." });
    } else {
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status: next } : j));
      setToast({ type: "success", message: next === "active" ? "İlan aktifleştirildi." : "İlan kapatıldı." });
    }
  }

  /* ── Delete ─────────────────────────────────────────────────────────── */
  async function handleDelete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("job_postings").delete().eq("id", id);

    if (error) {
      setToast({ type: "error", message: "İlan silinirken bir hata oluştu." });
    } else {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setToast({ type: "success", message: "İlan silindi." });
    }
  }

  /* ── Derived stats ──────────────────────────────────────────────────── */
  const activeCount = jobs.filter((j) => j.status === "active").length;
  const closedCount = jobs.length - activeCount;
  const isLoading   = userLoading || listLoading;

  return (
    <>
      <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-violet-400 inline-block" />
              {t.jobs_heading}
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 ml-3">
              Sertifikalı denizcilere ulaşmak için ilanlarınızı yönetin.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/20 whitespace-nowrap cursor-pointer shrink-0 self-start"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {t.jobs_add}
          </button>
        </div>

        {/* ── Stats ───────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
                <Skeleton className="h-3 w-20 mb-3" /><Skeleton className="h-7 w-12" />
              </div>
            ))}
          </div>
        ) : jobs.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Toplam İlan",  value: jobs.length,   color: "text-white"       },
              { label: "Aktif",        value: activeCount,   color: "text-emerald-400" },
              { label: "Kapalı",       value: closedCount,   color: "text-slate-400"   },
            ].map((s) => (
              <div key={s.label} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl px-5 py-4 hover:border-slate-600/60 transition-colors">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Job list ────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 animate-pulse flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-700/60 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-3" />
                  <Skeleton className="h-3 w-64 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-lg" />
                    <Skeleton className="h-6 w-20 rounded-lg" />
                    <Skeleton className="h-6 w-16 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl">
            <EmptyState onAdd={() => setShowModal(true)} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}

        {/* ── Info note ───────────────────────────────────────────── */}
        {!isLoading && jobs.length > 0 && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <svg className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aktif ilanlarınız sertifikalı denizcilere gösterilir. GRT ve rütbe filtreleri sayesinde uygun adaylar otomatik olarak eşleştirilir.
            </p>
          </div>
        )}

      </div>

      {showModal && <AddModal onClose={() => setShowModal(false)} onSave={handleSave} saving={saving} />}
      {toast      && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
