"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Locale } from "@/lib/dictionaries";
import trDict from "@/dictionaries/tr.json";
import enDict from "@/dictionaries/en.json";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
    </svg>
  );
}

export default function LoginContent({ locale }: { locale: Locale }) {
  const t = (locale === "en" ? enDict : trDict).login_page;
  const router = useRouter();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError(t.err_email);
    if (!password)     return setError(t.err_password);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) {
      if (signInError.message.toLowerCase().includes("invalid login"))         setError(t.err_invalid);
      else if (signInError.message.toLowerCase().includes("email not confirmed")) setError(t.err_unconfirmed);
      else setError(signInError.message);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D2FF] to-transparent blur-[100px] rounded-full mix-blend-screen" />
      </div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-transparent blur-[80px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-tr from-[#00D2FF]/20 to-blue-600/10 rounded-3xl blur-xl opacity-60" aria-hidden />
        <div className="relative bg-[#0B1221]/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 shadow-2xl">

          <div className="flex flex-col items-center gap-3 mb-8">
            <Link href="/" className="text-3xl font-black tracking-tighter" aria-label="MarinCV">
              <span className="text-white">Marin</span><span className="text-[#00D2FF]">CV</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{t.heading}</h1>
              <p className="text-sm text-slate-400 mt-1">{t.subheading}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">{t.email_label}</label>
              <input id="email" type="email" placeholder={t.email_ph} value={email}
                onChange={(e) => { setError(null); setEmail(e.target.value); }}
                autoComplete="email"
                className="w-full bg-slate-800/50 border border-slate-700/60 text-white placeholder:text-slate-500 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:border-[#00D2FF] focus:ring-2 focus:ring-[#00D2FF]/20" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">{t.password_label}</label>
                <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-[#00D2FF] transition-colors">{t.forgot}</Link>
              </div>
              <div className="relative flex items-center">
                <input id="password" type={showPassword ? "text" : "password"} placeholder={t.password_ph}
                  value={password} onChange={(e) => { setError(null); setPassword(e.target.value); }}
                  autoComplete="current-password"
                  className="w-full bg-slate-800/50 border border-slate-700/60 text-white placeholder:text-slate-500 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:border-[#00D2FF] focus:ring-2 focus:ring-[#00D2FF]/20 pr-10" />
                <span className="absolute right-3 text-slate-500">
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="hover:text-slate-300 transition-colors cursor-pointer">
                    <EyeIcon open={showPassword} />
                  </button>
                </span>
              </div>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-[#00D2FF] text-[#050B14] font-bold text-sm hover:bg-white transition-all duration-300 shadow-lg shadow-[#00D2FF]/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.submitting}
                </>
              ) : t.submit}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700/60" />
            <span className="text-xs text-slate-500">{t.divider}</span>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>

          <p className="text-center text-sm text-slate-500">
            {t.no_account}{" "}
            <Link href="/register" className="font-semibold text-slate-300 hover:text-[#00D2FF] transition-colors">{t.register_link}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
