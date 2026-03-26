"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [sent,      setSent]      = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Lütfen e-posta adresinizi girin.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Geçerli bir e-posta adresi girin.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (resetErr) {
      setError("İşlem başarısız oldu: " + resetErr.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D2FF] to-transparent blur-[100px] rounded-full mix-blend-screen" />
      </div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-transparent blur-[80px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card glow */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-[#00D2FF]/20 to-blue-600/10 rounded-3xl blur-xl opacity-60" aria-hidden />

        <div className="relative bg-[#0B1221]/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <Link href="/" className="text-3xl font-black tracking-tighter" aria-label="MarinCV">
              <span className="text-white">Marin</span><span className="text-[#00D2FF]">CV</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Şifremi Unuttum</h1>
              <p className="text-sm text-slate-400 mt-1">
                {sent
                  ? "E-postanızı kontrol edin."
                  : "E-posta adresinizi girin, sıfırlama bağlantısı gönderelim."}
              </p>
            </div>
          </div>

          {sent ? (
            /* ── Success State ── */
            <div className="flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="text-center px-2">
                <p className="text-sm font-semibold text-white mb-1">Sıfırlama bağlantısı gönderildi</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-300 font-medium">{email}</span> adresine şifre sıfırlama bağlantısı gönderdik. Gelen kutunuzu (ve spam klasörünüzü) kontrol edin.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-xs text-slate-400 hover:text-[#00D2FF] transition-colors underline underline-offset-2 cursor-pointer"
              >
                Farklı bir e-posta dene
              </button>
            </div>
          ) : (
            /* ── Form State ── */
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  E-posta Adresi
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => { setError(null); setEmail(e.target.value); }}
                  autoComplete="email"
                  autoFocus
                  className="w-full bg-slate-800/50 border border-slate-700/60 text-white placeholder:text-slate-500 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:border-[#00D2FF] focus:ring-2 focus:ring-[#00D2FF]/20"
                />
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-[#00D2FF] text-[#050B14] font-bold text-sm hover:bg-white transition-all duration-300 shadow-lg shadow-[#00D2FF]/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Gönderiliyor...
                  </>
                ) : (
                  "Sıfırlama Bağlantısı Gönder"
                )}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700/60" />
            <span className="text-xs text-slate-500">veya</span>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
          <p className="text-center text-sm text-slate-500">
            Şifrenizi hatırladınız mı?{" "}
            <Link href="/login" className="font-semibold text-slate-300 hover:text-[#00D2FF] transition-colors">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
