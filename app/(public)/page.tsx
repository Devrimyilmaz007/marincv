import Link from 'next/link';
import { getServerDictionary } from '@/lib/dictionaries';

export const dynamic = "force-dynamic";

export default async function Home() {
  const { dict } = await getServerDictionary();
  const { hero, mockup, stats, features, footer } = dict;

  return (
    <div className="relative overflow-hidden">

      {/* Arka Plan Glow Efekti */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D2FF] to-transparent blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* Hero Section */}
      <section
        aria-labelledby="hero-heading"
        className="relative pt-20 pb-20 lg:pt-28 lg:pb-32 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10"
      >
        {/* Sol Taraf: Tipografi ve CTA */}
        <div className="flex flex-col gap-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-max">
            <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse" aria-hidden="true" />
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">
              {hero.badge}
            </span>
          </div>

          {/* Başlık */}
          <h1
            id="hero-heading"
            className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
          >
            {hero.title_line1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
              {hero.title_line2}
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-blue-500">
              {hero.title_line3}
            </span>
          </h1>

          {/* Alt Başlık */}
          <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
            {hero.subtitle}
          </p>

          {/* CTA Butonları */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/register?type=employer"
              className="bg-[#00D2FF] text-[#050B14] font-semibold px-7 py-3.5 rounded-full hover:bg-white transition-all duration-300 flex items-center gap-2 group"
            >
              {hero.cta_primary}
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/register?type=candidate"
              className="bg-white/5 text-white border border-white/10 font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 transition-all duration-300"
            >
              {hero.cta_secondary}
            </Link>
          </div>
        </div>

        {/* Sağ Taraf: Glassmorphism Dashboard Mockup */}
        <div className="relative w-full aspect-square md:aspect-auto md:h-[560px]">
          <div
            className="absolute inset-0 bg-gradient-to-tr from-[#00D2FF]/20 to-transparent rounded-3xl rotate-3 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative w-full h-full bg-[#0B1221]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 hover:-translate-y-2 transition-transform duration-500">

            {/* Profil Başlığı */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-[#00D2FF] flex items-center justify-center text-white font-bold text-sm">
                  AK
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{mockup.name}</div>
                  <div className="text-xs text-slate-400">{mockup.title}</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                {mockup.verified_badge}
              </span>
            </div>

            {/* Deneyim Detayları */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <div className="text-xs text-slate-500 mb-1">{mockup.grt_label}</div>
                <div className="text-lg font-semibold text-white">150.000+</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <div className="text-xs text-slate-500 mb-1">{mockup.vessel_label}</div>
                <div className="text-lg font-semibold text-white">{mockup.vessel_value}</div>
              </div>
            </div>

            {/* Doğrulanmış Belgeler */}
            <div>
              <div className="text-xs text-slate-500 mb-3">{mockup.docs_label}</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700">
                  STCW 2010
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700">
                  C1/D Vizesi
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-[#00D2FF]/10 text-[#00D2FF] text-xs border border-[#00D2FF]/20">
                  Tanker Familiarization
                </span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
              <button className="w-full py-3 rounded-xl bg-white text-[#050B14] font-semibold text-sm hover:bg-slate-200 transition-colors">
                {mockup.cta}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats Band ──────────────────────────────────────────────── */}
      <div className="relative z-10 bg-[#0B1221]/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: stats.seafarers_value, label: stats.seafarers_label, accent: "text-[#00D2FF]"   },
              { value: stats.employers_value, label: stats.employers_label, accent: "text-violet-400"  },
              { value: stats.stcw_value,      label: stats.stcw_label,      accent: "text-emerald-400" },
              { value: stats.match_value,     label: stats.match_label,     accent: "text-amber-400"   },
            ].map(({ value, label, accent }) => (
              <div key={label}>
                <dt className={`text-3xl font-black tracking-tight ${accent}`}>{value}</dt>
                <dd className="text-xs text-slate-500 mt-1.5 font-medium">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section aria-labelledby="features-heading" className="relative z-10 py-24 px-6">
        {/* Section glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-10 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-radial from-[#0B2447] to-transparent blur-[80px] rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4"
            >
              {features.heading}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-blue-400">
                MarinCV?
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              {features.subheading}
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 — Akıllı Eşleştirme */}
            <div className="group relative bg-[#0B1221]/70 backdrop-blur-sm border border-white/5 rounded-2xl p-7 hover:border-[#00D2FF]/20 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00D2FF]/0 to-[#00D2FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D2FF]/20 to-blue-600/10 border border-[#00D2FF]/20 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-[#00D2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14z" />
                    <circle cx="10" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{features.f1_title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  {features.f1_desc}
                </p>
                <ul className="space-y-2" aria-label={features.f1_title}>
                  {[features.f1_b1, features.f1_b2, features.f1_b3].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="w-3.5 h-3.5 text-[#00D2FF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card 2 — Doğrulanmış Belgeler */}
            <div className="group relative bg-[#0B1221]/70 backdrop-blur-sm border border-white/5 rounded-2xl p-7 hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{features.f2_title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  {features.f2_desc}
                </p>
                <ul className="space-y-2" aria-label={features.f2_title}>
                  {[features.f2_b1, features.f2_b2, features.f2_b3].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card 3 — Dijital Hizmet Defteri */}
            <div className="group relative bg-[#0B1221]/70 backdrop-blur-sm border border-white/5 rounded-2xl p-7 hover:border-violet-500/20 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-500/20 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{features.f3_title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  {features.f3_desc}
                </p>
                <ul className="space-y-2" aria-label={features.f3_title}>
                  {[features.f3_b1, features.f3_b2, features.f3_b3].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-[#03060A] border-t border-white/5" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">

          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10">

            {/* Brand */}
            <div className="md:col-span-1">
              <div className="text-2xl font-black tracking-tighter text-white mb-3">
                Marin<span className="text-[#00D2FF]">CV</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                {footer.tagline}
              </p>
              {/* Social icons placeholder */}
              <div className="flex gap-3 mt-5">
                {[
                  { label: "LinkedIn", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
                  { label: "X / Twitter", path: "M4 4l16 16M4 20L20 4" },
                ].map(({ label, path }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-600 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Platform links */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">{footer.platform}</h3>
              <ul className="space-y-3">
                {[
                  { href: "/jobs",       label: footer.jobs       },
                  { href: "/candidates", label: footer.candidates  },
                  { href: "/employers",  label: footer.employers   },
                  { href: "/register",   label: footer.register    },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-slate-500 hover:text-slate-200 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">{footer.legal}</h3>
              <ul className="space-y-3">
                {[
                  { href: "/gizlilik", label: footer.privacy  },
                  { href: "/sartlar",  label: footer.terms    },
                  { href: "/cerezler", label: footer.cookies   },
                  { href: "/iletisim", label: footer.contact   },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-slate-500 hover:text-slate-200 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-600">{footer.copyright}</p>
            <p className="text-xs text-slate-700">{footer.copyright_sub}</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
