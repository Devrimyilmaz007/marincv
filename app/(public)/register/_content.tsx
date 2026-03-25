"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Locale } from "@/lib/dictionaries";
import trDict from "@/dictionaries/tr.json";
import enDict from "@/dictionaries/en.json";

type UserType = "candidate" | "employer";

const COUNTRY_CODES = [
  { code: "TR", flag: "🇹🇷", dial: "+90",  label: "Türkiye"    },
  { code: "PH", flag: "🇵🇭", dial: "+63",  label: "Filipinler" },
  { code: "GB", flag: "🇬🇧", dial: "+44",  label: "İngiltere"  },
  { code: "US", flag: "🇺🇸", dial: "+1",   label: "ABD"        },
  { code: "GR", flag: "🇬🇷", dial: "+30",  label: "Yunanistan" },
  { code: "HR", flag: "🇭🇷", dial: "+385", label: "Hırvatistan"},
  { code: "DE", flag: "🇩🇪", dial: "+49",  label: "Almanya"    },
  { code: "NO", flag: "🇳🇴", dial: "+47",  label: "Norveç"     },
  { code: "UA", flag: "🇺🇦", dial: "+380", label: "Ukrayna"    },
  { code: "RU", flag: "🇷🇺", dial: "+7",   label: "Rusya"      },
  { code: "IN", flag: "🇮🇳", dial: "+91",  label: "Hindistan"  },
  { code: "CN", flag: "🇨🇳", dial: "+86",  label: "Çin"        },
] as const;
type CountryCode = (typeof COUNTRY_CODES)[number]["code"];

interface FormState {
  name: string; phone: string; dialCode: CountryCode;
  email: string; password: string; passwordConfirm: string;
}

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

function InputField({ id, label, type = "text", placeholder, value, onChange, autoComplete, suffix }: {
  id: string; label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; autoComplete?: string; suffix?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>
      <div className="relative flex items-center">
        <input id={id} type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete}
          className="w-full bg-slate-800/50 border border-slate-700/60 text-white placeholder:text-slate-500 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:border-[#00D2FF] focus:ring-2 focus:ring-[#00D2FF]/20 pr-10" />
        {suffix && <span className="absolute right-3 text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

function PhoneField({ value, onChange, dialCode, onDialChange, label, placeholder }: {
  value: string; onChange: (v: string) => void; dialCode: CountryCode;
  onDialChange: (code: CountryCode) => void; label: string; placeholder: string;
}) {
  const active = COUNTRY_CODES.find((c) => c.code === dialCode) ?? COUNTRY_CODES[0];
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="phone" className="text-sm font-medium text-slate-300">{label}</label>
      <div className="flex items-stretch bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden transition-all duration-200 focus-within:border-[#00D2FF] focus-within:ring-2 focus-within:ring-[#00D2FF]/20">
        <div className="relative flex items-center border-r border-slate-700 shrink-0">
          <div className="flex items-center gap-1.5 pl-3 pr-7 py-3 pointer-events-none select-none">
            <span className="text-base leading-none">{active.flag}</span>
            <span className="text-sm font-semibold text-slate-300">{active.dial}</span>
          </div>
          <svg className="absolute right-2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <select value={dialCode} onChange={(e) => onDialChange(e.target.value as CountryCode)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.label} ({c.dial})</option>)}
          </select>
        </div>
        <input id="phone" type="tel" inputMode="numeric" placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d\s]/g, ""))}
          autoComplete="tel-national" maxLength={15}
          className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm px-3.5 py-3 outline-none" />
      </div>
    </div>
  );
}

/* ── Register Form ───────────────────────────────────────────────────────── */
function RegisterForm({ locale }: { locale: Locale }) {
  const t = (locale === "en" ? enDict : trDict).register_page;
  const searchParams = useSearchParams();

  const [userType,            setUserType]            = useState<UserType>("candidate");
  const [showPassword,        setShowPassword]        = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState<string | null>(null);
  const [success,             setSuccess]             = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ name:"", phone:"", dialCode:"TR", email:"", password:"", passwordConfirm:"" });

  useEffect(() => {
    if (searchParams.get("type") === "employer") setUserType("employer");
  }, [searchParams]);

  const setField = (field: keyof FormState) => (value: string) => {
    setError(null);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!form.name.trim())                         return setError(t.err_name);
    if (!form.email.trim())                        return setError(t.err_email);
    if (form.password.length < 8)                  return setError(t.err_password_short);
    if (form.password !== form.passwordConfirm)    return setError(t.err_password_match);
    setLoading(true);
    const dialEntry = COUNTRY_CODES.find((c) => c.code === form.dialCode);
    const fullPhone = dialEntry ? `${dialEntry.dial}${form.phone.replace(/\s/g, "")}` : form.phone;
    const supabase  = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { role: userType, full_name: form.name.trim(), phone: fullPhone } },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(t.success);
      setForm({ name:"", phone:"", dialCode:"TR", email:"", password:"", passwordConfirm:"" });
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D2FF] to-transparent blur-[100px] rounded-full mix-blend-screen" />
      </div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-transparent blur-[80px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-tr from-[#00D2FF]/20 to-blue-600/10 rounded-3xl blur-xl opacity-60" aria-hidden />
        <div className="relative bg-[#0B1221]/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 shadow-2xl">

          <div className="flex flex-col items-center gap-3 mb-8">
            <Link href="/" className="text-3xl font-black tracking-tighter">
              <span className="text-white">Marin</span><span className="text-[#00D2FF]">CV</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{t.heading}</h1>
              <p className="text-sm text-slate-400 mt-1">{t.subheading}</p>
            </div>
          </div>

          {/* User type toggle */}
          <div className="flex bg-slate-900/60 border border-slate-700/60 rounded-xl p-1 mb-7" role="group">
            {([
              { type: "candidate" as UserType, label: `🧑‍✈️  ${t.type_candidate}` },
              { type: "employer"  as UserType, label: `🚢  ${t.type_employer}`   },
            ] as const).map(({ type, label }) => (
              <button key={type} type="button" onClick={() => setUserType(type)} aria-pressed={userType === type}
                className={["flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all duration-200 text-center cursor-pointer",
                  userType === type
                    ? type === "candidate" ? "bg-[#00D2FF] text-[#050B14] shadow-md shadow-[#00D2FF]/20" : "bg-white text-[#050B14] shadow-md"
                    : "text-slate-400 hover:text-slate-200",
                ].join(" ")}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <InputField id="name"
              label={userType === "candidate" ? t.name_label_cand : t.name_label_emp}
              placeholder={userType === "candidate" ? t.name_ph_cand : t.name_ph_emp}
              value={form.name} onChange={setField("name")}
              autoComplete={userType === "candidate" ? "name" : "organization"} />

            <PhoneField value={form.phone} onChange={setField("phone")}
              dialCode={form.dialCode} onDialChange={(code) => setForm((prev) => ({ ...prev, dialCode: code }))}
              label={t.phone_label} placeholder={t.phone_ph} />

            <InputField id="email" label={t.email_label} type="email" placeholder={t.email_ph}
              value={form.email} onChange={setField("email")} autoComplete="email" />

            <InputField id="password" label={t.password_label}
              type={showPassword ? "text" : "password"} placeholder={t.password_ph}
              value={form.password} onChange={setField("password")} autoComplete="new-password"
              suffix={
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                  <EyeIcon open={showPassword} />
                </button>
              } />

            <InputField id="password-confirm" label={t.password_confirm}
              type={showPasswordConfirm ? "text" : "password"} placeholder={t.password_confirm_ph}
              value={form.passwordConfirm} onChange={setField("passwordConfirm")} autoComplete="new-password"
              suffix={
                <button type="button" onClick={() => setShowPasswordConfirm((v) => !v)}
                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                  <EyeIcon open={showPasswordConfirm} />
                </button>
              } />

            <p className="text-xs text-slate-500 leading-relaxed mt-1">{t.terms}</p>

            {error && (
              <div role="alert" className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div role="status" className="flex items-start gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
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

          <p className="text-center text-sm text-slate-500 mt-6">
            {t.has_account}{" "}
            <Link href="/login" className="font-semibold text-slate-300 hover:text-[#00D2FF] transition-colors">{t.login_link}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterContent({ locale }: { locale: Locale }) {
  return (
    <Suspense>
      <RegisterForm locale={locale} />
    </Suspense>
  );
}
