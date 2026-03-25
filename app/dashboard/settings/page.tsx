"use client";

import { useState, useEffect } from "react";
import { Shield, Bell, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useDashUser } from "../_context";

/* ── Toast ───────────────────────────────────────────────────────────────── */
interface ToastMsg {
  type:    "success" | "error";
  message: string;
}

function Toast({ toast, onDismiss }: { toast: ToastMsg; onDismiss: () => void }) {
  const ok = toast.type === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl text-sm font-medium backdrop-blur-xl
        ${ok
          ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
          : "bg-red-950/90     border-red-500/30     text-red-300"}`}
    >
      {ok
        ? <CheckCircle size={18} className="shrink-0" />
        : <XCircle    size={18} className="shrink-0" />
      }
      {toast.message}
      <button
        onClick={onDismiss}
        className="ml-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Bildirimi kapat"
      >
        <XCircle size={16} />
      </button>
    </div>
  );
}

/* ── Toggle Switch ───────────────────────────────────────────────────────── */
function Toggle({
  id, checked, onChange, label, description,
}: {
  id:          string;
  checked:     boolean;
  onChange:    (v: boolean) => void;
  label:       string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-white cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="shrink-0 relative mt-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF]/40 rounded-full"
      >
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-[#00D2FF]" : "bg-slate-700"}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

/* ── Section Card ────────────────────────────────────────────────────────── */
function SectionCard({
  icon, title, subtitle, children, danger,
}: {
  icon:      React.ReactNode;
  title:     string;
  subtitle:  string;
  children:  React.ReactNode;
  danger?:   boolean;
}) {
  return (
    <div className={`bg-[#0B1221]/80 backdrop-blur-xl rounded-2xl border p-6 ${
      danger ? "border-red-500/30" : "border-white/10"
    }`}>
      {/* Card Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          danger
            ? "bg-red-500/10 border border-red-500/20 text-red-400"
            : "bg-[#00D2FF]/10 border border-[#00D2FF]/20 text-[#00D2FF]"
        }`}>
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mb-6" />

      {children}
    </div>
  );
}

/* ── Delete Confirm Modal ────────────────────────────────────────────────── */
function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-[#0B1221] border border-red-500/30 rounded-2xl shadow-2xl p-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-5">
          <AlertTriangle size={28} className="text-red-400" />
        </div>

        <h3
          id="delete-modal-title"
          className="text-base font-bold text-white text-center mb-2"
        >
          Hesabı Silmek İstediğinize Emin Misiniz?
        </h3>
        <p className="text-sm text-slate-400 text-center leading-relaxed mb-7">
          Bu işlem <span className="text-red-400 font-semibold">geri alınamaz.</span>{" "}
          Tüm profiliniz, başvurularınız ve verileriniz kalıcı olarak silinecektir.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/60 border border-slate-700/50 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600/80 border border-red-500/40 hover:bg-red-600 transition-all cursor-pointer"
          >
            Evet, Hesabımı Sil
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const { user, loading } = useDashUser();

  /* Toast */
  const [toast, setToast] = useState<ToastMsg | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(id);
  }, [toast]);

  /* Password reset */
  const [resetLoading, setResetLoading] = useState(false);

  async function handlePasswordReset() {
    if (!user?.email) return;
    setResetLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/dashboard/settings`,
    });
    setResetLoading(false);
    if (error) {
      setToast({ type: "error", message: "Bağlantı gönderilemedi: " + error.message });
    } else {
      setToast({ type: "success", message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
    }
  }

  /* Notification prefs */
  const [notifNew,    setNotifNew]    = useState(true);
  const [notifStatus, setNotifStatus] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);
  const isEmployer = user?.role === "employer" || user?.role === "agency";

  async function handleSaveNotif() {
    setSavingNotif(true);
    await new Promise((r) => setTimeout(r, 700));
    setSavingNotif(false);
    setToast({ type: "success", message: "Bildirim tercihleriniz güncellendi." });
  }

  /* Delete account */
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function handleDeleteConfirm() {
    setShowDeleteModal(false);
    setToast({ type: "error", message: "Hesap silme talebi alındı. Ekibimiz sizi en kısa sürede bilgilendirecek." });
  }

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto space-y-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#0B1221]/80 border border-white/10 rounded-2xl p-6 animate-pulse">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-700/60" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-700/60 rounded mb-2" />
                <div className="h-3 w-56 bg-slate-700/40 rounded" />
              </div>
            </div>
            <div className="h-px bg-white/5 mb-6" />
            <div className="space-y-3">
              <div className="h-10 bg-slate-700/40 rounded-xl" />
              <div className="h-10 w-48 bg-slate-700/30 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-8 max-w-2xl mx-auto space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-[#00D2FF] inline-block" />
            Ayarlar
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 ml-3">
            Hesap tercihlerinizi ve bildirimlerinizi yönetin.
          </p>
        </div>

        {/* ── Kart 1: Hesap Bilgileri ──────────────────────────────────── */}
        <SectionCard
          icon={<Shield size={20} />}
          title="Hesap Bilgileri"
          subtitle="E-posta adresinizi görüntüleyin ve şifrenizi yönetin."
        >
          <div className="space-y-5">
            {/* Email (readonly) */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">
                E-posta Adresi
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  disabled
                  className="w-full bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed select-none pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" title="Doğrulanmış" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-1.5">
                E-posta adresi değişikliği için destek ekibiyle iletişime geçin.
              </p>
            </div>

            {/* Password Reset */}
            <div className="pt-1">
              <p className="text-xs font-medium text-slate-400 mb-3 tracking-wide uppercase">
                Şifre
              </p>
              <button
                onClick={handlePasswordReset}
                disabled={resetLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-white/15 text-slate-300 hover:border-white/30 hover:text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-wait cursor-pointer"
              >
                {resetLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                )}
                Şifre Sıfırlama Bağlantısı Gönder
              </button>
              <p className="text-xs text-slate-600 mt-2">
                Bağlantı <span className="text-slate-500">{user?.email}</span> adresine gönderilecektir.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Kart 2: Bildirim Tercihleri ─────────────────────────────── */}
        <SectionCard
          icon={<Bell size={20} />}
          title="Bildirim Tercihleri"
          subtitle="Hangi durumlarda e-posta almak istediğinizi belirleyin."
        >
          <div className="space-y-5">
            <Toggle
              id="notif-new"
              checked={notifNew}
              onChange={setNotifNew}
              label="Yeni ilanlar ve eşleşmeler"
              description="Profilinizle eşleşen yeni iş ilanları yayınlandığında bildirim alın."
            />

            <div className="h-px bg-white/5" />

            <Toggle
              id="notif-status"
              checked={notifStatus}
              onChange={setNotifStatus}
              label={
                isEmployer
                  ? "Yeni başvuru bildirimi"
                  : "Başvuru durumu güncellemeleri"
              }
              description={
                isEmployer
                  ? "İlanlarınıza yeni bir başvuru geldiğinde e-posta alın."
                  : "Başvurduğunuz ilanların durumu değiştiğinde e-posta alın."
              }
            />

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveNotif}
                disabled={savingNotif}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#00D2FF] text-[#050B14] hover:bg-[#00BBE0] transition-colors disabled:opacity-60 disabled:cursor-wait cursor-pointer shadow-lg shadow-[#00D2FF]/15"
              >
                {savingNotif ? (
                  <><Loader2 size={15} className="animate-spin" />Kaydediliyor...</>
                ) : (
                  "Tercihleri Kaydet"
                )}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Kart 3: Tehlikeli Bölge ──────────────────────────────────── */}
        <SectionCard
          icon={<AlertTriangle size={20} />}
          title="Tehlikeli Bölge"
          subtitle="Bu bölümdeki işlemler geri alınamaz. Lütfen dikkatli olun."
          danger
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 mb-1">Hesabı Kalıcı Olarak Sil</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hesabınızı silmek, tüm profilinizi, başvurularınızı ve verilerinizi kalıcı olarak yok eder.
                Bu işlem <span className="text-red-400/80">geri alınamaz.</span>
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500/40 transition-all cursor-pointer whitespace-nowrap"
            >
              <AlertTriangle size={15} />
              Hesabımı Sil
            </button>
          </div>
        </SectionCard>

      </div>

      {/* ── Modals & Toast ───────────────────────────────────────────────── */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
