import type { Metadata } from "next";
import Link from "next/link";
import { getServerDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "İşverenler | MarinCV",
};

export const dynamic = "force-dynamic";

export default async function EmployersPage() {
  const { dict } = await getServerDictionary();
  const t = dict.employers_page;

  const FEATURES = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      color: "from-emerald-600 to-teal-500",
      title: t.f1_title,
      desc:  t.f1_desc,
      bullets: [t.f1_b1, t.f1_b2, t.f1_b3],
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-9.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v16.5c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V3.375zm-9.75 9.75" />
        </svg>
      ),
      color: "from-[#00D2FF] to-blue-500",
      title: t.f2_title,
      desc:  t.f2_desc,
      bullets: [t.f2_b1, t.f2_b2, t.f2_b3],
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
      color: "from-violet-600 to-purple-500",
      title: t.f3_title,
      desc:  t.f3_desc,
      bullets: [t.f3_b1, t.f3_b2, t.f3_b3],
    },
  ];

  const STEPS = [
    { num: "01", title: t.step1_title, desc: t.step1_desc },
    { num: "02", title: t.step2_title, desc: t.step2_desc },
    { num: "03", title: t.step3_title, desc: t.step3_desc },
    { num: "04", title: t.step4_title, desc: t.step4_desc },
  ];

  const STATS = [
    { value: t.stat1_value, label: t.stat1_label },
    { value: t.stat2_value, label: t.stat2_label },
    { value: t.stat3_value, label: t.stat3_label },
    { value: t.stat4_value, label: t.stat4_label },
  ];

  const TESTIMONIALS = [
    { quote: t.testimonial1_quote, author: t.testimonial1_author, role: t.testimonial1_role },
    { quote: t.testimonial2_quote, author: t.testimonial2_author, role: t.testimonial2_role },
    { quote: t.testimonial3_quote, author: t.testimonial3_author, role: t.testimonial3_role },
  ];

  return (
    <div className="min-h-screen bg-[#050B14] text-slate-200">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-15">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B2447] via-[#00D2FF]/20 to-transparent blur-[120px] rounded-full" />
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse" />
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">{t.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            {t.h1_line1}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-blue-400">
              {t.h1_line2}
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.subtitle}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00D2FF] text-[#050B14] text-base font-bold hover:bg-white transition-all duration-200 shadow-xl shadow-[#00D2FF]/20 group">
              {t.cta_primary}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link href="/candidates"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-base font-semibold hover:bg-white/10 transition-all duration-200">
              {t.cta_secondary}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/5">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">{t.why_heading}</h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm">{t.why_subheading}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="group relative bg-[#0B1221]/80 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{f.desc}</p>
                <ul className="space-y-1.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="w-3.5 h-3.5 text-[#00D2FF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">{t.steps_heading}</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm">{t.steps_subheading}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-start">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%+0.5rem)] w-full h-px bg-gradient-to-r from-[#00D2FF]/30 to-transparent" aria-hidden />
                )}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D2FF]/20 to-blue-600/10 border border-[#00D2FF]/25 flex items-center justify-center text-[#00D2FF] font-black text-sm mb-4">
                  {step.num}
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="bg-[#0B1221]/60 border border-white/5 rounded-2xl p-6">
                <svg className="w-6 h-6 text-[#00D2FF]/40 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-sm text-slate-300 leading-relaxed mb-4 italic">"{t.quote}"</p>
                <div>
                  <p className="text-xs font-semibold text-white">{t.author}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-10 rounded-3xl bg-gradient-to-br from-[#0B2447]/80 to-[#050B14] border border-[#00D2FF]/15 overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00D2FF] opacity-10 blur-[80px] rounded-full pointer-events-none" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">{t.cta_heading}</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">{t.cta_subtitle}</p>
              <Link href="/register"
                className="inline-flex items-center gap-3 px-9 py-4 rounded-xl bg-[#00D2FF] text-[#050B14] text-base font-black hover:bg-white transition-all duration-200 shadow-2xl shadow-[#00D2FF]/25 group">
                {t.cta_button}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <p className="text-xs text-slate-600 mt-4">
                {t.cta_login}{" "}
                <Link href="/login" className="text-slate-400 hover:text-white transition-colors underline underline-offset-2">
                  {t.cta_login_link}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
