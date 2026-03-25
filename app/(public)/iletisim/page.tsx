"use client";

import { useState, useEffect } from "react";

/* ── Toast ───────────────────────────────────────────────────────────────── */
interface ToastMsg { type: "success" | "error"; message: string }

function Toast({ toast, onDismiss }: { toast: ToastMsg; onDismiss: () => void }) {
  const isSuccess = toast.type === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl text-sm font-medium backdrop-blur-xl max-w-sm ${
        isSuccess
          ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
          : "bg-red-950/90 border-red-500/30 text-red-300"
      }`}
    >
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isSuccess
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        }
      </svg>
      {toast.message}
      <button
        onClick={onDismiss}
        aria-label="Kapat"
        className="ml-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ── Contact Info Item ───────────────────────────────────────────────────── */
function InfoItem({ icon, label, value, sub }: {
  icon:  React.ReactNode;
  label: string;
  value: string;
  sub?:  string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/20 flex items-center justify-center text-[#00D2FF] shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-0.5 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
const SUBJECTS = [
  "Genel Soru",
  "Teknik Destek",
  "Hesap / Üyelik",
  "Faturalandırma",
  "Hukuki / KVKK",
  "İş Birliği",
  "Diğer",
] as const;

interface FormState {
  name:    string;
  email:   string;
  subject: string;
  message: string;
}

export default function IletisimPage() {
  const [form,    setForm]    = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState<ToastMsg | null>(null);
  const [errors,  setErrors]  = useState<Partial<FormState>>({});

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.name.trim())    e.name    = "Ad Soyad zorunludur.";
    if (!form.email.trim())   e.email   = "E-posta zorunludur.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Geçerli bir e-posta giriniz.";
    if (!form.subject)        e.subject = "Lütfen bir konu seçin.";
    if (!form.message.trim()) e.message = "Mesaj alanı boş bırakılamaz.";
    else if (form.message.trim().length < 20) e.message = "Mesajınız en az 20 karakter olmalıdır.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulated delay
    setLoading(false);
    setForm({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setToast({
      type:    "success",
      message: "Mesajınız başarıyla alındı. En kısa sürede dönüş yapacağız.",
    });
  }

  function field(key: keyof FormState, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  const inputBase = "w-full bg-[#0D1629] border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-all";
  const inputOk   = "border-slate-700/50 focus:border-[#00D2FF]/60 focus:ring-2 focus:ring-[#00D2FF]/10";
  const inputErr  = "border-red-500/40 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10";

  return (
    <div className="min-h-screen bg-[#050B14]">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D2FF] to-transparent blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-24">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse" />
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">7/24 Destek</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Bizimle İletişime Geçin
          </h1>
          <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            Sorularınız, önerileriniz veya teknik destek talepleriniz için
            formu doldurun, ekibimiz en kısa sürede dönüş yapar.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">

          {/* ── Left: Contact Info ────────────────────────────────── */}
          <aside className="lg:col-span-2 space-y-8">

            <div className="space-y-6">
              <InfoItem
                label="Destek E-postası"
                value="info@marincv.com"
                sub="Ortalama yanıt süresi: 4 saat"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                }
              />
              <InfoItem
                label="Adres"
                value="Antalya, Türkiye"
                sub="Liman Mahallesi, Denizcilik Cad."
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                }
              />
              <InfoItem
                label="Çalışma Saatleri"
                value="Pzt – Cum: 09:00 – 18:00"
                sub="Türkiye saatiyle (UTC+3)"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Social */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-4">Sosyal Medya</p>
              <div className="flex gap-3">
                {[
                  {
                    label: "LinkedIn",
                    path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
                  },
                  {
                    label: "X / Twitter",
                    path: "M4 4l16 16M4 20L20 4",
                  },
                  {
                    label: "Instagram",
                    path: "M6.75 3h10.5A3.75 3.75 0 0121 6.75v10.5A3.75 3.75 0 0117.25 21H6.75A3.75 3.75 0 013 17.25V6.75A3.75 3.75 0 016.75 3zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm5.25.375a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
                  },
                ].map(({ label, path }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400 hover:text-[#00D2FF] hover:border-[#00D2FF]/30 hover:bg-[#00D2FF]/5 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Response time card */}
            <div className="p-4 rounded-2xl bg-[#0B1221]/60 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-semibold text-emerald-400">Destek Ekibi Aktif</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mesai saatleri dışındaki talepler bir sonraki iş günü yanıtlanır.
                Acil durumlarda e-posta konu satırına{" "}
                <span className="text-slate-400 font-mono">[URGENT]</span> ekleyin.
              </p>
            </div>
          </aside>

          {/* ── Right: Contact Form ───────────────────────────────── */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-[#0B1221]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-8 space-y-5"
            >
              <h2 className="text-lg font-bold text-white mb-1">Mesaj Gönder</h2>
              <p className="text-xs text-slate-500 pb-2">
                Tüm alanlar zorunludur. Bilgileriniz üçüncü taraflarla paylaşılmaz.
              </p>

              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-medium text-slate-400 mb-1.5">
                    Ad Soyad
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Ali Kaptan"
                    value={form.name}
                    onChange={(e) => field("name", e.target.value)}
                    className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                  />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-medium text-slate-400 mb-1.5">
                    E-posta Adresi
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="ali@example.com"
                    value={form.email}
                    onChange={(e) => field("email", e.target.value)}
                    className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
                  />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="contact-subject" className="block text-xs font-medium text-slate-400 mb-1.5">
                  Konu
                </label>
                <div className="relative">
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => field("subject", e.target.value)}
                    className={`${inputBase} appearance-none pr-9 ${errors.subject ? inputErr : inputOk} ${!form.subject ? "text-slate-600" : "text-white"}`}
                  >
                    <option value="" disabled>Konu seçin…</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="block text-xs font-medium text-slate-400 mb-1.5">
                  Mesajınız
                </label>
                <textarea
                  id="contact-message"
                  rows={6}
                  placeholder="Mesajınızı buraya yazın… (en az 20 karakter)"
                  value={form.message}
                  onChange={(e) => field("message", e.target.value)}
                  className={`${inputBase} resize-none ${errors.message ? inputErr : inputOk}`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.message
                    ? <p className="text-xs text-red-400">{errors.message}</p>
                    : <span />
                  }
                  <span className={`text-xs ml-auto ${form.message.length < 20 ? "text-slate-600" : "text-slate-500"}`}>
                    {form.message.length} karakter
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#00D2FF] text-[#050B14] text-sm font-bold hover:bg-white transition-all duration-200 shadow-lg shadow-[#00D2FF]/20 disabled:opacity-60 disabled:cursor-wait cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#050B14]/25 border-t-[#050B14] rounded-full animate-spin" />
                    Gönderiliyor…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Mesajı Gönder
                  </>
                )}
              </button>

              <p className="text-xs text-center text-slate-600 pt-1">
                Formu göndererek{" "}
                <a href="/gizlilik" className="underline hover:text-slate-400 transition-colors">
                  Gizlilik Politikamızı
                </a>{" "}
                kabul etmiş olursunuz.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
