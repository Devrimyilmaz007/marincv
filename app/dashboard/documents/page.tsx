"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDashUser } from "../_context";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Certificate {
  id:          string;
  profile_id:  string;
  name:        string;
  issue_date:  string;
  expiry_date: string | null;
}

interface CertForm {
  preset:      string;
  customName:  string;
  issueDate:   string;
  expiryDate:  string;
  neverExpires: boolean;
}

interface ToastMsg {
  type:    "success" | "error";
  message: string;
}

/* ── Maritime Certificate Presets ───────────────────────────────────────── */
const CERT_PRESETS = [
  "STCW Temel Güvenlik Eğitimi",
  "STCW İleri Yangın Söndürme",
  "STCW İleri Tıbbi İlk Yardım",
  "STCW Hayatta Kalma ve Kurtarma Teknesi",
  "GMDSS – GOC Belgesi",
  "GMDSS – ROC Belgesi",
  "ECDIS Type Specific",
  "Radar / ARPA Operatör",
  "Kimyasal Tanker Familiarization",
  "Petrol Tankeri Familiarization",
  "LNG / LPG Tanker Familiarization",
  "Ro-Ro Familiarization",
  "High Speed Craft",
  "C1/D ABD Vizesi",
  "Schengen Vizesi",
  "Denizci Cüzdanı",
  "Denizci Kimliği",
  "Diğer...",
] as const;

const EMPTY_FORM: CertForm = {
  preset:      "",
  customName:  "",
  issueDate:   "",
  expiryDate:  "",
  neverExpires: false,
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function certStatus(expiry: string | null): {
  label: string;
  color: "green" | "yellow" | "red" | "slate";
} {
  if (!expiry) return { label: "Süresiz", color: "slate" };
  const diff = (new Date(expiry).getTime() - Date.now()) / 86_400_000;
  if (diff < 0)   return { label: "Süresi Dolmuş",      color: "red"    };
  if (diff < 90)  return { label: "Yakında Dolacak",     color: "yellow" };
  return           { label: "Geçerli",                   color: "green"  };
}

const STATUS_STYLES: Record<string, string> = {
  green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  yellow: "bg-amber-500/10   text-amber-400   border-amber-500/20",
  red:    "bg-red-500/10     text-red-400     border-red-500/20",
  slate:  "bg-slate-700/40   text-slate-400   border-slate-600/40",
};

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });
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

/* ── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ toast, onDismiss }: { toast: ToastMsg; onDismiss: () => void }) {
  const isSuccess = toast.type === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl text-sm font-medium backdrop-blur-xl transition-all
        ${isSuccess
          ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
          : "bg-red-950/90     border-red-500/30     text-red-300"}`}
    >
      {isSuccess ? (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      )}
      {toast.message}
      <button
        onClick={onDismiss}
        className="ml-2 text-current opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Bildirimi kapat"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ── Add Certificate Modal ───────────────────────────────────────────────── */
function AddModal({
  onClose,
  onSave,
  saving,
}: {
  onClose: () => void;
  onSave:  (form: CertForm) => Promise<void>;
  saving:  boolean;
}) {
  const [form, setForm] = useState<CertForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CertForm, string>>>({});

  const isCustom = form.preset === "Diğer...";
  const certName = isCustom ? form.customName : form.preset;

  function validate(): boolean {
    const e: typeof errors = {};
    if (!certName.trim())    e.preset     = "Belge adı zorunludur.";
    if (!form.issueDate)     e.issueDate  = "Veriliş tarihi zorunludur.";
    if (!form.neverExpires && !form.expiryDate)
      e.expiryDate = "Geçerlilik tarihi girin ya da 'Süresiz' seçin.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSave({ ...form, customName: certName });
  }

  /* Close on Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative w-full max-w-lg bg-[#0B1221] border border-slate-700/60 rounded-2xl shadow-2xl p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="modal-title" className="text-base font-bold text-white">Yeni Belge Ekle</h2>
            <p className="text-xs text-slate-400 mt-0.5">Belge bilgilerini eksiksiz doldurun.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1"
            aria-label="Modalı kapat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {/* Certificate Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">
              Belge Adı
            </label>
            <div className="relative">
              <select
                value={form.preset}
                onChange={(e) => setForm((f) => ({ ...f, preset: e.target.value, customName: "" }))}
                className="w-full appearance-none bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all pr-9"
              >
                <option value="">— Belge seçin —</option>
                {CERT_PRESETS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {isCustom && (
              <input
                type="text"
                placeholder="Belge adını yazın…"
                value={form.customName}
                onChange={(e) => setForm((f) => ({ ...f, customName: e.target.value }))}
                className="mt-2 w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all"
                autoFocus
              />
            )}
            {errors.preset && <p className="mt-1 text-xs text-red-400">{errors.preset}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">
                Veriliş Tarihi
              </label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all"
              />
              {errors.issueDate && <p className="mt-1 text-xs text-red-400">{errors.issueDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">
                Geçerlilik Tarihi
              </label>
              <input
                type="date"
                value={form.expiryDate}
                disabled={form.neverExpires}
                onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                className="w-full bg-[#0D1629] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
              {errors.expiryDate && <p className="mt-1 text-xs text-red-400">{errors.expiryDate}</p>}
            </div>
          </div>

          {/* Never Expires Toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.neverExpires}
                onChange={(e) => setForm((f) => ({ ...f, neverExpires: e.target.checked, expiryDate: "" }))}
              />
              <div className={`w-9 h-5 rounded-full transition-colors ${form.neverExpires ? "bg-[#00D2FF]" : "bg-slate-700"}`} />
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.neverExpires ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
              Süresiz
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 mt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#00D2FF] text-[#050B14] hover:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#050B14]/30 border-t-[#050B14] rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Kaydet"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Certificate Card ────────────────────────────────────────────────────── */
function CertCard({
  cert,
  onDelete,
}: {
  cert:     Certificate;
  onDelete: (id: string) => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const status = certStatus(cert.expiry_date);

  async function handleDelete() {
    setDeleting(true);
    await onDelete(cert.id);
    setDeleting(false);
    setConfirmDelete(false);
  }

  return (
    <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 hover:border-slate-600/60 transition-colors group">
      <div className="flex items-start justify-between gap-3">

        {/* Left: name + dates */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-3">
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[status.color]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                status.color === "green"  ? "bg-emerald-400" :
                status.color === "yellow" ? "bg-amber-400"   :
                status.color === "red"    ? "bg-red-400"     :
                "bg-slate-400"
              }`} />
              {status.label}
            </span>
          </div>

          <p className="text-sm font-semibold text-white truncate">{cert.name}</p>

          <div className="flex items-center gap-4 mt-2.5">
            <div>
              <p className="text-xs text-slate-500">Veriliş</p>
              <p className="text-xs font-medium text-slate-300">{fmtDate(cert.issue_date)}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" aria-hidden="true" />
            <div>
              <p className="text-xs text-slate-500">Geçerlilik</p>
              <p className={`text-xs font-medium ${
                status.color === "red" ? "text-red-400" :
                status.color === "yellow" ? "text-amber-400" :
                "text-slate-300"
              }`}>
                {cert.expiry_date ? fmtDate(cert.expiry_date) : "Süresiz"}
              </p>
            </div>
          </div>
        </div>

        {/* Right: delete controls */}
        <div className="shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:block">Emin misin?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
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
              aria-label={`${cert.name} belgesini sil`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          )}
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-white mb-2">Henüz belge eklenmemiş</h3>
      <p className="text-sm text-slate-400 max-w-xs mb-6">
        STCW sertifikalarınızı ve mesleki belgelerinizi ekleyerek profilinizin görünürlüğünü artırın.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/25 text-[#00D2FF] text-sm font-semibold hover:bg-[#00D2FF]/20 transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        İlk Belgeyi Ekle
      </button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function DocumentsPage() {
  const { user, loading: userLoading, dict } = useDashUser();
  const t = dict.dashboard;

  const [certs,       setCerts]       = useState<Certificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState<ToastMsg | null>(null);

  /* ── Auto-dismiss toast ────────────────────────────────────────────── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Fetch certificates ────────────────────────────────────────────── */
  const fetchCerts = useCallback(async (userId: string) => {
    setCertsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("profile_id", userId)
      .order("issue_date", { ascending: false });

    if (error) {
      setToast({ type: "error", message: "Belgeler yüklenirken bir hata oluştu." });
    } else {
      setCerts(data ?? []);
    }
    setCertsLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id) fetchCerts(user.id);
  }, [user?.id, fetchCerts]);

  /* ── Insert ─────────────────────────────────────────────────────────── */
  async function handleSave(form: CertForm): Promise<void> {
    if (!user) return;
    setSaving(true);

    const name        = form.preset === "Diğer..." ? form.customName : form.preset;
    const expiry_date = form.neverExpires ? null : form.expiryDate || null;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("certificates")
      .insert({ profile_id: user.id, name, issue_date: form.issueDate, expiry_date })
      .select()
      .single();

    setSaving(false);

    if (error) {
      setToast({ type: "error", message: error.message });
    } else {
      setCerts((prev) => [data, ...prev]);
      setShowModal(false);
      setToast({ type: "success", message: `"${name}" başarıyla eklendi.` });
    }
  }

  /* ── Delete ─────────────────────────────────────────────────────────── */
  async function handleDelete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("certificates").delete().eq("id", id);

    if (error) {
      setToast({ type: "error", message: "Belge silinirken bir hata oluştu." });
    } else {
      setCerts((prev) => prev.filter((c) => c.id !== id));
      setToast({ type: "success", message: "Belge başarıyla silindi." });
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────── */
  const isLoading = userLoading || certsLoading;

  return (
    <>
      <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">

        {/* ── Page Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-[#00D2FF] inline-block" />
              {t.docs_heading}
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 ml-3">
              Platformdaki görünürlüğünüzü artırmak için geçerli belgelerinizi ekleyin.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D2FF] text-[#050B14] text-sm font-semibold hover:bg-white transition-all duration-200 shadow-lg shadow-[#00D2FF]/20 whitespace-nowrap cursor-pointer shrink-0 self-start"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.docs_add}
          </button>
        </div>

        {/* ── Stats Strip ─────────────────────────────────────────────── */}
        {!isLoading && certs.length > 0 && (() => {
          const valid   = certs.filter((c) => certStatus(c.expiry_date).color !== "red").length;
          const expired = certs.length - valid;
          return (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Toplam Belge",    value: certs.length,  color: "text-white"        },
                { label: t.doc_valid,   value: valid,   color: "text-emerald-400" },
                { label: t.doc_expired, value: expired, color: "text-red-400"    },
              ].map((s) => (
                <div key={s.label} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl px-5 py-4">
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── Certificate List ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#0B1221] border border-slate-700/40 rounded-2xl p-5 animate-pulse">
                <Skeleton className="h-5 w-20 rounded-full mb-3" />
                <Skeleton className="h-4 w-48 mb-3" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : certs.length === 0 ? (
          <div className="bg-[#0B1221] border border-slate-700/40 rounded-2xl">
            <EmptyState onAdd={() => setShowModal(true)} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certs.map((cert) => (
              <CertCard key={cert.id} cert={cert} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* ── Info Note ───────────────────────────────────────────────── */}
        {!isLoading && certs.length > 0 && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <svg className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-xs text-slate-400 leading-relaxed">
              Belge doğrulama işlemleri platform ekibi tarafından manuel olarak yapılmaktadır.
              Belgelerinizin fiziksel kopyalarını profil sayfanızdan yükleyebileceksiniz.
            </p>
          </div>
        )}

      </div>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
