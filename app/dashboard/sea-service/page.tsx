"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDashUser } from "../_context";
import { SHIP_TYPES, RANK_PRESETS, typeGradient } from "@/lib/vessel-data";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface SeaServiceRecord {
  id:            string;
  profile_id:    string;
  ship_name:     string;
  ship_type:     string;
  grt:           number | null;
  kw:            number | null;
  rank:          string;
  sign_on_date:  string;
  sign_off_date: string | null;
}

interface ServiceForm {
  shipName:    string;
  shipType:    string;
  grt:         string;
  kw:          string;
  rank:        string;
  customRank:  string;
  signOn:      string;
  signOff:     string;
  stillOnboard: boolean;
}

interface ToastMsg {
  type:    "success" | "error";
  message: string;
}

/* ── Presets ─────────────────────────────────────────────────────────────── */

const EMPTY_FORM: ServiceForm = {
  shipName:    "",
  shipType:    "",
  grt:         "",
  kw:          "",
  rank:        "",
  customRank:  "",
  signOn:      "",
  signOff:     "",
  stillOnboard: false,
};

const typeColor = typeGradient;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function daysBetween(from: string, to: string | null): number {
  const a = new Date(from).getTime();
  const b = to ? new Date(to).getTime() : Date.now();
  return Math.max(0, Math.floor((b - a) / 86_400_000));
}

function formatDuration(totalDays: number): string {
  const years  = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  if (years === 0 && months === 0) return "< 1 Ay";
  if (years === 0)  return `${months} Ay`;
  if (months === 0) return `${years} Yıl`;
  return `${years} Yıl ${months} Ay`;
}

function calcTotalService(records: SeaServiceRecord[]): string {
  const days = records.reduce((acc, r) => acc + daysBetween(r.sign_on_date, r.sign_off_date), 0);
  return formatDuration(days);
}

function highestGRT(records: SeaServiceRecord[]): string {
  const vals = records.map((r) => r.grt ?? 0).filter(Boolean);
  if (!vals.length) return "—";
  return Math.max(...vals).toLocaleString("tr-TR");
}

function mostWorkedType(records: SeaServiceRecord[]): string {
  const counts: Record<string, number> = {};
  for (const r of records) counts[r.ship_type] = (counts[r.ship_type] ?? 0) + 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? "—";
}

function fmtDate(d: string | null): string {
  if (!d) return "Devam Ediyor";
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function fmtNum(n: number | null): string {
  if (n == null || n === 0) return "—";
  return n.toLocaleString("tr-TR");
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-slate-700/50 ${className ?? ""}`} aria-hidden="true" />;
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ toast, onDismiss }: { toast: ToastMsg; onDismiss: () => void }) {
  const ok = toast.type === "success";
  return (
    <div
      role="status" aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl text-sm font-medium backdrop-blur-xl
        ${ok ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/90     border-red-500/30     text-red-300"}`}
    >
      {ok ? (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
      )}
      {toast.message}
      <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Kapat">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

/* ── Field helpers ───────────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">{children}</label>;
}

function TextInput({ value, onChange, placeholder, disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <input
      type="text" value={value} disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    />
  );
}

function NumberInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="number" value={value} min={0}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

function SelectInput({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all pr-9"
      >
        {children}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function DateInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <input
      type="date" value={value} disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={`w-9 h-5 rounded-full transition-colors ${checked ? "bg-[#00D2FF]" : "bg-slate-700"}`} />
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </div>
      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </label>
  );
}

/* ── Add Modal ───────────────────────────────────────────────────────────── */
function AddModal({ onClose, onSave, saving }: { onClose: () => void; onSave: (f: ServiceForm) => Promise<void>; saving: boolean }) {
  const [form,   setForm]   = useState<ServiceForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const isCustomRank = form.rank === "Diğer...";
  const effectiveRank = isCustomRank ? form.customRank : form.rank;

  function set<K extends keyof ServiceForm>(k: K, v: ServiceForm[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.shipName.trim()) e.shipName = "Gemi adı zorunludur.";
    if (!form.shipType)        e.shipType = "Gemi tipi seçiniz.";
    if (!effectiveRank.trim()) e.rank     = "Rütbe / Görev zorunludur.";
    if (!form.signOn)          e.signOn   = "Katılış tarihi zorunludur.";
    if (!form.stillOnboard && !form.signOff) e.signOff = "Ayrılış tarihi girin ya da 'Hala gemideyim' seçin.";
    if (form.signOff && form.signOn && form.signOff < form.signOn) e.signOff = "Ayrılış tarihi katılıştan önce olamaz.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSave({ ...form, customRank: effectiveRank });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0B1221] border border-slate-700/60 rounded-2xl shadow-2xl p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-white">Yeni Deniz Hizmeti Ekle</h2>
            <p className="text-xs text-slate-400 mt-0.5">Gemi bilgilerini eksiksiz doldurun.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1" aria-label="Kapat">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          {/* Row 1: Ship name + type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Gemi Adı</Label>
              <TextInput value={form.shipName} onChange={(v) => set("shipName", v)} placeholder="MT BOSPHORUS STAR" />
              {errors.shipName && <p className="mt-1 text-xs text-red-400">{errors.shipName}</p>}
            </div>
            <div>
              <Label>Gemi Tipi</Label>
              <SelectInput value={form.shipType} onChange={(v) => set("shipType", v)}>
                <option value="">— Tip seçin —</option>
                {SHIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </SelectInput>
              {errors.shipType && <p className="mt-1 text-xs text-red-400">{errors.shipType}</p>}
            </div>
          </div>

          {/* Row 2: GRT + kW */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>GRT (Gross Tonnage)</Label>
              <NumberInput value={form.grt} onChange={(v) => set("grt", v)} placeholder="150000" />
            </div>
            <div>
              <Label>Motor Gücü (kW) <span className="normal-case text-slate-600 ml-1">opsiyonel</span></Label>
              <NumberInput value={form.kw} onChange={(v) => set("kw", v)} placeholder="12000" />
            </div>
          </div>

          {/* Row 3: Rank */}
          <div>
            <Label>Rütbe / Görev</Label>
            <SelectInput value={form.rank} onChange={(v) => set("rank", v)}>
              <option value="">— Rütbe seçin —</option>
              {RANK_PRESETS.map((r) => <option key={r} value={r}>{r}</option>)}
            </SelectInput>
            {isCustomRank && (
              <input
                type="text" value={form.customRank}
                onChange={(e) => set("customRank", e.target.value)}
                placeholder="Rütbenizi yazın…"
                autoFocus
                className="mt-2 w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all"
              />
            )}
            {errors.rank && <p className="mt-1 text-xs text-red-400">{errors.rank}</p>}
          </div>

          {/* Row 4: Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Katılış Tarihi</Label>
              <DateInput value={form.signOn} onChange={(v) => set("signOn", v)} />
              {errors.signOn && <p className="mt-1 text-xs text-red-400">{errors.signOn}</p>}
            </div>
            <div>
              <Label>Ayrılış Tarihi</Label>
              <DateInput value={form.signOff} onChange={(v) => set("signOff", v)} disabled={form.stillOnboard} />
              {errors.signOff && <p className="mt-1 text-xs text-red-400">{errors.signOff}</p>}
            </div>
          </div>

          {/* Still onboard toggle */}
          <Toggle
            checked={form.stillOnboard}
            onChange={(v) => set("stillOnboard", v)}
            label="Hala bu gemide çalışıyorum"
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 mt-1 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
              İptal
            </button>
            <button
              type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#00D2FF] text-[#050B14] hover:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-[#050B14]/30 border-t-[#050B14] rounded-full animate-spin" />Kaydediliyor...</>
              ) : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Service Card ────────────────────────────────────────────────────────── */
function ServiceCard({ record, onDelete }: { record: SeaServiceRecord; onDelete: (id: string) => Promise<void> }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  const isOnboard = !record.sign_off_date;
  const duration  = formatDuration(daysBetween(record.sign_on_date, record.sign_off_date));
  const gradient  = typeColor(record.ship_type);

  async function handleDelete() {
    setDeleting(true);
    await onDelete(record.id);
    setDeleting(false);
    setConfirmDelete(false);
  }

  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-colors group">
      <div className="flex items-start gap-4">

        {/* Ship type icon */}
        <div className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 0C9.5 4 7.5 5.5 7.5 8v1H5l-2 7h18l-2-7h-2.5V8C16.5 5.5 14.5 4 12 4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 19c1.5 1.5 4 1.5 5.5 0S12 17.5 13.5 19s4 1.5 5.5 0" />
          </svg>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-bold text-white">{record.ship_name}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs font-medium text-slate-300">{record.rank}</span>
                <span className="text-slate-700" aria-hidden="true">·</span>
                <span className="text-xs text-slate-500">{record.ship_type}</span>
                {isOnboard && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-[#00D2FF] text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-pulse" />
                    Aktif
                  </span>
                )}
              </div>
            </div>

            {/* Delete controls */}
            <div className="shrink-0">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
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
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                  aria-label={`${record.ship_name} kaydını sil`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Dates + GRT/kW strip */}
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Katılış</p>
              <p className="text-xs font-medium text-slate-300">{fmtDate(record.sign_on_date)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Ayrılış</p>
              <p className={`text-xs font-medium ${isOnboard ? "text-[#00D2FF]" : "text-slate-300"}`}>
                {fmtDate(record.sign_off_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Süre</p>
              <p className="text-xs font-semibold text-white">{duration}</p>
            </div>
            <div className="flex gap-3">
              {record.grt && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">GRT</p>
                  <p className="text-xs font-semibold text-[#00D2FF]">{fmtNum(record.grt)}</p>
                </div>
              )}
              {record.kw && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">kW</p>
                  <p className="text-xs font-semibold text-slate-300">{fmtNum(record.kw)}</p>
                </div>
              )}
            </div>
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
      <div className="w-16 h-16 rounded-2xl bg-[#00D2FF]/10 border border-[#00D2FF]/20 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#00D2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 0C9.5 4 7.5 5.5 7.5 8v1H5l-2 7h18l-2-7h-2.5V8C16.5 5.5 14.5 4 12 4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 19c1.5 1.5 4 1.5 5.5 0S12 17.5 13.5 19s4 1.5 5.5 0" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-white mb-2">Henüz deniz hizmeti eklenmemiş</h3>
      <p className="text-sm text-slate-400 max-w-xs mb-6">
        Geçmiş gemi tecrübelerinizi ekleyerek armatörlerin sizi daha kolay bulmasını sağlayın.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/25 text-[#00D2FF] text-sm font-semibold hover:bg-[#00D2FF]/20 transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        İlk Hizmeti Ekle
      </button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function SeaServicePage() {
  const { user, loading: userLoading, dict } = useDashUser();
  const t = dict.dashboard;

  const [records,     setRecords]     = useState<SeaServiceRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState<ToastMsg | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* Fetch */
  const fetchRecords = useCallback(async (userId: string) => {
    setListLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sea_service")
      .select("*")
      .eq("profile_id", userId)
      .order("sign_on_date", { ascending: false });

    if (error) setToast({ type: "error", message: "Kayıtlar yüklenirken bir hata oluştu." });
    else setCerts(data ?? []);
    setListLoading(false);
  }, []);

  function setCerts(data: SeaServiceRecord[]) { setRecords(data); }

  useEffect(() => {
    if (user?.id) fetchRecords(user.id);
  }, [user?.id, fetchRecords]);

  /* Insert */
  async function handleSave(form: ServiceForm): Promise<void> {
    if (!user) return;
    setSaving(true);

    const rank      = form.rank === "Diğer..." ? form.customRank : form.rank;
    const sign_off  = form.stillOnboard ? null : (form.signOff || null);
    const grt       = form.grt  ? parseInt(form.grt,  10) : null;
    const kw        = form.kw   ? parseInt(form.kw,   10) : null;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("sea_service")
      .insert({
        profile_id:    user.id,
        ship_name:     form.shipName,
        ship_type:     form.shipType,
        grt,
        kw,
        rank,
        sign_on_date:  form.signOn,
        sign_off_date: sign_off,
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      setToast({ type: "error", message: error.message });
    } else {
      setRecords((prev) => [data, ...prev]);
      setShowModal(false);
      setToast({ type: "success", message: `"${form.shipName}" kaydı eklendi.` });
    }
  }

  /* Delete */
  async function handleDelete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("sea_service").delete().eq("id", id);

    if (error) {
      setToast({ type: "error", message: "Kayıt silinirken bir hata oluştu." });
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setToast({ type: "success", message: "Kayıt başarıyla silindi." });
    }
  }

  const isLoading = userLoading || listLoading;

  return (
    <>
      <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-[#00D2FF] inline-block" />
              {t.sea_heading}
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 ml-3">
              Geçmiş gemi görevlerinizi ekleyerek CV'nizi güçlendirin.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D2FF] text-[#050B14] text-sm font-semibold hover:bg-white transition-all duration-200 shadow-lg shadow-[#00D2FF]/20 whitespace-nowrap cursor-pointer shrink-0 self-start"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {t.sea_add}
          </button>
        </div>

        {/* ── Stats Strip ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5">
                <Skeleton className="h-3 w-28 mb-3" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        ) : records.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: t.sea_stat_total,
                value: calcTotalService(records),
                accent: true,
                icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                label: t.sea_stat_grt,
                value: highestGRT(records),
                accent: false,
                icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
              },
              {
                label: "En Çok Çalışılan Tip",
                value: mostWorkedType(records),
                accent: false,
                icon: "M12 3v1m0 0C9.5 4 7.5 5.5 7.5 8v1H5l-2 7h18l-2-7h-2.5V8C16.5 5.5 14.5 4 12 4zm-9 16c1.5 1.5 4 1.5 5.5 0S12 17.5 13.5 19s4 1.5 5.5 0",
              },
            ].map((s) => (
              <div key={s.label} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
                </div>
                <p className={`text-xl font-bold truncate ${s.accent ? "text-[#00D2FF]" : "text-white"}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Record List ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 animate-pulse flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-700/60 shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-56 mb-4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl">
            <EmptyState onAdd={() => setShowModal(true)} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {records.map((r) => (
              <ServiceCard key={r.id} record={r} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* ── Info note ───────────────────────────────────────────── */}
        {!isLoading && records.length > 0 && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <svg className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deniz hizmet kayıtlarınız, armatörler tarafından GRT ve kW limitine göre filtreleme yapılırken kullanılır. Verilerin doğruluğunu kontrol edin.
            </p>
          </div>
        )}

      </div>

      {showModal && <AddModal onClose={() => setShowModal(false)} onSave={handleSave} saving={saving} />}
      {toast      && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
