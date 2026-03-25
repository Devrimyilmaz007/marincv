import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | MarinCV",
  description: "MarinCV platformunun kişisel verilerin işlenmesine ilişkin gizlilik politikası.",
};

const SECTIONS = [
  {
    title: "1. Veri Sorumlusu",
    body: `MarinCV Teknoloji A.Ş. ("MarinCV", "biz", "bizim"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket etmektedir. Bu Gizlilik Politikası, platformumuzu kullanan tüm ziyaretçiler, denizci adaylar ve işveren/armatör kullanıcılar için geçerlidir.`,
  },
  {
    title: "2. Toplanan Kişisel Veriler",
    body: `Platformumuz aracılığıyla şu kişisel veriler toplanabilmektedir:\n\n• **Kimlik Verileri:** Ad, soyad, doğum tarihi, uyruk, cüzdan numarası.\n• **İletişim Verileri:** E-posta adresi, telefon numarası, şehir ve adres bilgileri.\n• **Mesleki Veriler:** Rütbe, deniz hizmet geçmişi (gemi adı, tipi, GRT, görev süresi), sertifikalar ve belgeler.\n• **Teknik Veriler:** IP adresi, cihaz bilgisi, tarayıcı türü, sayfa görüntüleme verileri.\n• **Hesap Verileri:** Şifrelenmiş parola hash'i, oturum bilgileri.`,
  },
  {
    title: "3. Verilerin İşlenme Amaçları",
    body: `Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:\n\n• Üyelik kaydı ve kimlik doğrulama işlemlerinin yürütülmesi,\n• Denizci profil ve özgeçmiş yönetiminin sağlanması,\n• İşveren ve aday eşleştirmesi ile ilan yönetimi,\n• Başvuru süreçlerinin takibi ve durum bildirimlerinin iletilmesi,\n• Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi,\n• Yasal yükümlülüklerin yerine getirilmesi,\n• Kullanıcı deneyiminin iyileştirilmesi ve analiz.`,
  },
  {
    title: "4. Verilerin Aktarılması",
    body: `Kişisel verileriniz; hizmet alınan iş ortakları (bulut altyapı, ödeme işlemcileri), resmi makamlar (yasal zorunluluk halinde) ve açık onayınız alınmış üçüncü taraflar dışında hiçbir kişi veya kurumla paylaşılmaz. Platformumuz, altyapı hizmetleri için Supabase (ABD) ve Vercel (ABD) hizmetlerini kullanmakta olup bu aktarımlar KVKK'nın 9. maddesi kapsamında gerçekleştirilmektedir.`,
  },
  {
    title: "5. Veri Saklama Süreleri",
    body: `Kişisel verileriniz, işlenme amacının ortadan kalkması veya hesabınızın silinmesi halinde yasal saklama süreleri dikkate alınarak imha edilir. Aktif hesaplar için veriler, üyelik süresi boyunca saklanır. Hesap silme talebinde bulunulması durumunda veriler, yasal yükümlülükler dışında 30 gün içinde silinir.`,
  },
  {
    title: "6. Kullanıcı Hakları",
    body: `KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:\n\n• Verilerinizin işlenip işlenmediğini öğrenme,\n• İşleniyorsa buna ilişkin bilgi talep etme,\n• Verilerin eksik veya yanlış olması halinde düzeltilmesini isteme,\n• Verilerin silinmesini veya yok edilmesini talep etme,\n• İşlemenin otomatik yollarla gerçekleştirilmesi halinde itiraz etme.\n\nBu haklarınızı kullanmak için **info@marincv.com** adresine yazılı başvuruda bulunabilirsiniz.`,
  },
  {
    title: "7. Çerez Politikası",
    body: `Platformumuzda çerez kullanımına ilişkin detaylı bilgiye Çerez Politikamızdan ulaşabilirsiniz. Oturum çerezleri ve analitik çerezler kullanılmaktadır.`,
  },
  {
    title: "8. Politika Değişiklikleri",
    body: `Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler öncesinde kayıtlı e-posta adresinize bildirim gönderilecektir. Politikanın güncel sürümü her zaman bu sayfada yayımlanacaktır.`,
  },
];

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-[#050B14]">
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-10">
          <Link href="/" className="hover:text-slate-400 transition-colors">Ana Sayfa</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-400">Gizlilik Politikası</span>
        </div>

        {/* Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-5">
            <svg className="w-3.5 h-3.5 text-[#00D2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Hukuki</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-sm text-slate-500">
            Son güncelleme: <time dateTime="2026-01-01">1 Ocak 2026</time>
          </p>
        </header>

        {/* Intro notice */}
        <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-[#00D2FF]/5 border border-[#00D2FF]/15 text-sm text-slate-400 mb-10">
          <svg className="w-5 h-5 text-[#00D2FF] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span>
            MarinCV olarak kişisel verilerinizin güvenliği en öncelikli değerimizdir.
            Bu politika, 6698 sayılı KVKK kapsamındaki haklarınızı ve yükümlülüklerimizi açıklamaktadır.
          </span>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-base font-bold text-white mb-3">{title}</h2>
              <div className="text-sm text-slate-400 leading-relaxed space-y-2">
                {body.split("\n\n").map((para, i) => (
                  <p key={i} className="whitespace-pre-line">{para.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer links */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-4 text-xs text-slate-600">
          <Link href="/sartlar"  className="hover:text-slate-400 transition-colors">Kullanım Koşulları</Link>
          <Link href="/cerezler" className="hover:text-slate-400 transition-colors">Çerez Politikası</Link>
          <Link href="/iletisim" className="hover:text-slate-400 transition-colors">İletişim</Link>
        </div>
      </div>
    </div>
  );
}
