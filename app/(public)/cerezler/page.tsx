import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Çerez Politikası | MarinCV",
  description: "MarinCV platformunun çerez kullanımı hakkında bilgi ve tercih yönetimi.",
};

const COOKIE_TYPES = [
  {
    name: "Zorunlu Çerezler",
    icon: "🔒",
    color: "border-emerald-500/20 bg-emerald-500/5",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    badgeLabel: "Her Zaman Aktif",
    desc: "Platformun temel işlevlerinin çalışması için zorunludur. Oturum yönetimi, güvenlik doğrulama ve dil tercihi bu çerezler aracılığıyla sağlanır. Devre dışı bırakılamaz.",
    examples: ["sb-auth-token (Supabase oturum)", "locale (Dil tercihi)", "csrf-token (Güvenlik)"],
    duration: "Oturum sonuna kadar / 7 güne kadar",
  },
  {
    name: "Analitik Çerezler",
    icon: "📊",
    color: "border-blue-500/20 bg-blue-500/5",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    badgeLabel: "Opsiyonel",
    desc: "Kullanıcıların platform ile nasıl etkileşime girdiğini anlamamıza yardımcı olan anonim istatistik çerezleridir. Kişisel veri içermez, yalnızca toplu veriler işlenir.",
    examples: ["_ga (Google Analytics)", "_gid (Oturum tanımlayıcı)", "plausible_ignore"],
    duration: "2 yıla kadar",
  },
  {
    name: "Fonksiyonel Çerezler",
    icon: "⚙️",
    color: "border-violet-500/20 bg-violet-500/5",
    badge: "bg-violet-500/15 text-violet-400 border-violet-500/25",
    badgeLabel: "Opsiyonel",
    desc: "Kullanıcı tercihlerini (tema, tablo görünümü vb.) hatırlamak amacıyla kullanılır. Bu çerezler olmadan bazı kişiselleştirilmiş özellikler düzgün çalışmayabilir.",
    examples: ["sidebar_collapsed (Menü durumu)", "dashboard_view (Görünüm tercihi)"],
    duration: "30 güne kadar",
  },
];

const SECTIONS = [
  {
    title: "Çerez Tercihlerinizi Yönetme",
    body: `Tarayıcınızın ayarlar menüsünden çerezleri yönetebilir, silebilir veya engelleyebilirsiniz. Zorunlu çerezlerin engellenmesi, platformun düzgün çalışmamasına yol açabilir.\n\nPopüler tarayıcılar için çerez yönetim rehberleri:\n• Google Chrome: Ayarlar > Gizlilik ve Güvenlik > Çerezler\n• Mozilla Firefox: Seçenekler > Gizlilik ve Güvenlik\n• Safari: Tercihler > Gizlilik`,
  },
  {
    title: "Üçüncü Taraf Çerezleri",
    body: `Platformumuz, analitik ve hata izleme amacıyla bazı üçüncü taraf hizmetlerini entegre etmektedir. Bu hizmetlerin kendi gizlilik politikaları geçerlidir:\n\n• Supabase (veritabanı/auth): supabase.com/privacy\n• Vercel (hosting/CDN): vercel.com/legal/privacy-policy`,
  },
  {
    title: "Politika Güncellemeleri",
    body: `Bu Çerez Politikası zaman zaman güncellenebilir. Önemli değişiklikler, platformda öne çıkan bir bildirim aracılığıyla duyurulacaktır. Politikanın en güncel hali her zaman bu sayfada yayımlanmaktadır.`,
  },
];

export default function CerezlerPage() {
  return (
    <div className="min-h-screen bg-[#050B14]">
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-10">
          <Link href="/" className="hover:text-slate-400 transition-colors">Ana Sayfa</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-400">Çerez Politikası</span>
        </div>

        {/* Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-5">
            <svg className="w-3.5 h-3.5 text-[#00D2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.049 1.837 2.128v1.5c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 012.25 18.75v-1.5c0-1.08.768-1.968 1.837-2.128A49.4 49.4 0 016 15.12m0 0c.37-.058.743-.109 1.118-.153" />
            </svg>
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Hukuki</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Çerez Politikası
          </h1>
          <p className="text-sm text-slate-500">
            Son güncelleme: <time dateTime="2026-01-01">1 Ocak 2026</time>
          </p>
        </header>

        {/* Intro */}
        <p className="text-sm text-slate-400 leading-relaxed mb-10">
          MarinCV, platform deneyimini kişiselleştirmek ve güvenli bir ortam sağlamak
          amacıyla çerezler ve benzer izleme teknolojileri kullanmaktadır. Bu politika,
          hangi çerezlerin kullanıldığını ve tercihlerinizi nasıl yönetebileceğinizi açıklamaktadır.
        </p>

        {/* Cookie type cards */}
        <div className="space-y-5 mb-14">
          {COOKIE_TYPES.map((ct) => (
            <div key={ct.name} className={`border rounded-2xl p-6 ${ct.color}`}>
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span aria-hidden>{ct.icon}</span>
                  {ct.name}
                </h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${ct.badge}`}>
                  {ct.badgeLabel}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{ct.desc}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {ct.examples.map((ex) => (
                  <code key={ex} className="text-xs text-slate-400 bg-black/20 border border-white/5 px-2 py-1 rounded-md font-mono">
                    {ex}
                  </code>
                ))}
              </div>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-500">Saklama süresi:</strong> {ct.duration}
              </p>
            </div>
          ))}
        </div>

        {/* Additional sections */}
        <div className="space-y-10">
          {SECTIONS.map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-base font-bold text-white mb-3">{title}</h2>
              <div className="text-sm text-slate-400 leading-relaxed">
                {body.split("\n\n").map((para, i) => (
                  <p key={i} className="whitespace-pre-line mb-2 last:mb-0">{para}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-xs text-slate-600">
          <Link href="/gizlilik" className="hover:text-slate-400 transition-colors">Gizlilik Politikası</Link>
          <Link href="/sartlar"  className="hover:text-slate-400 transition-colors">Kullanım Koşulları</Link>
          <Link href="/iletisim" className="hover:text-slate-400 transition-colors">İletişim</Link>
        </div>
      </div>
    </div>
  );
}
