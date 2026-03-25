import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | MarinCV",
  description: "MarinCV platformunun kullanım koşulları ve hizmet sözleşmesi.",
};

const SECTIONS = [
  {
    title: "1. Taraflar ve Kapsam",
    body: `Bu Kullanım Koşulları Sözleşmesi ("Sözleşme"), MarinCV Teknoloji A.Ş. ("MarinCV") ile platformumuzu kullanan gerçek veya tüzel kişiler ("Kullanıcı") arasında akdedilmektedir. Platforma erişim sağlamak veya hesap oluşturmak, bu Sözleşme'nin tüm hükümlerini kabul ettiğiniz anlamına gelir.`,
  },
  {
    title: "2. Hizmet Tanımı",
    body: `MarinCV, ticari denizcilik ve yatçılık sektöründe;\n\n• Denizci adayların dijital özgeçmiş ve deniz hizmet defteri oluşturmasına,\n• İşveren ve armatörlerin sertifikalı personel filtrelemesine,\n• İlan yayınlama ve başvuru yönetimi süreçlerine\n\nimkân tanıyan bir İK (İnsan Kaynakları) SaaS platformudur. Platform, taraflar arasındaki iş ilişkisinin aracısı olmayıp eşleştirme hizmetini sağlamaktadır.`,
  },
  {
    title: "3. Hesap Oluşturma ve Güvenlik",
    body: `Platforma kayıt sırasında sağlanan bilgilerin doğru, eksiksiz ve güncel olması Kullanıcı'nın sorumluluğundadır. Hesap güvenliğinden (şifre güvenliği dahil) Kullanıcı sorumludur. MarinCV, yetkisiz erişimlerden kaynaklanacak zararlardan sorumlu tutulamaz. Şüpheli faaliyetlerin derhal info@marincv.com adresine bildirilmesi gerekmektedir.`,
  },
  {
    title: "4. Kullanıcı Yükümlülükleri",
    body: `Kullanıcılar platform üzerinde;\n\n• Sahte kimlik veya belge yüklemek,\n• Başkasına ait hesabı kullanmak,\n• Otomatik yöntemlerle (bot, scraper vb.) veri toplamak,\n• Diğer kullanıcılara yönelik taciz veya spam faaliyetlerde bulunmak,\n• Türk Hukuku ve uluslararası mevzuata aykırı her türlü faaliyeti yürütmekten\n\nkesinlikle kaçınmak zorundadır. Bu yükümlülüklerin ihlali hesabın derhal askıya alınmasına yol açar.`,
  },
  {
    title: "5. Ücretlendirme ve Abonelik",
    body: `MarinCV, belirli özellikleri için ücretli abonelik planları sunabilir. Ücretli planların detayları platform içinde ayrıca duyurulur. İptal prosedürleri abonelik sayfasında belirtilir. İlk 30 günlük deneme süreci ücretsizdir; kredi kartı bilgisi alınmaz. Yasal düzenlemeler çerçevesinde iade politikamız geçerlidir.`,
  },
  {
    title: "6. Fikri Mülkiyet",
    body: `Platform üzerindeki tüm içerik, yazılım, tasarım, logo ve marka unsurları MarinCV'ye aittir ve Fikir ve Sanat Eserleri Kanunu kapsamında korunmaktadır. Kullanıcılar, platform üzerinden yükledikleri içeriklerin (CV, belge, fotoğraf) sorumluluğunu üstlenir. MarinCV, bu içerikleri yalnızca hizmet kapsamında ve Gizlilik Politikası çerçevesinde kullanır.`,
  },
  {
    title: "7. Sorumluluk Sınırlaması",
    body: `MarinCV; platform üzerinde gerçekleşecek eşleşmelerin iş akdine dönüşeceğini, belge doğruluğunu veya adayların ileri sürdüğü nitelikleri garanti etmez. Kullanıcıların kendi aralarındaki iş ilişkisinden doğacak anlaşmazlıklardan MarinCV sorumlu tutulamaz. Platformun kullanımından kaynaklanan dolaylı veya sonuç olarak ortaya çıkan zararlar için MarinCV'nin sorumluluğu, son 3 aylık abonelik ücreti ile sınırlıdır.`,
  },
  {
    title: "8. Hizmet Değişiklikleri ve Fesih",
    body: `MarinCV, önceden bildirim yapmak kaydıyla platform özelliklerini değiştirme, kısıtlama veya sonlandırma hakkını saklı tutar. Sözleşme'nin ihlali halinde hesap önceden bildirim yapılmaksızın askıya alınabilir ya da silinebilir.`,
  },
  {
    title: "9. Uygulanacak Hukuk ve Yetki",
    body: `Bu Sözleşme, Türkiye Cumhuriyeti hukukuna tabidir. Doğabilecek tüm uyuşmazlıklarda Antalya Mahkemeleri ve İcra Daireleri yetkilidir.`,
  },
];

export default function SartlarPage() {
  return (
    <div className="min-h-screen bg-[#050B14]">
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-10">
          <Link href="/" className="hover:text-slate-400 transition-colors">Ana Sayfa</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-400">Kullanım Koşulları</span>
        </div>

        {/* Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-5">
            <svg className="w-3.5 h-3.5 text-[#00D2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">Hukuki</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Kullanım Koşulları
          </h1>
          <p className="text-sm text-slate-500">
            Son güncelleme: <time dateTime="2026-01-01">1 Ocak 2026</time>
          </p>
        </header>

        {/* Intro */}
        <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-sm text-slate-400 mb-10">
          <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>
            Lütfen platformu kullanmadan önce bu koşulları dikkatlice okuyunuz.
            Platforma erişim, tüm maddelerin kabul edildiği anlamına gelmektedir.
          </span>
        </div>

        {/* Sections */}
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
          <Link href="/cerezler" className="hover:text-slate-400 transition-colors">Çerez Politikası</Link>
          <Link href="/iletisim" className="hover:text-slate-400 transition-colors">İletişim</Link>
        </div>
      </div>
    </div>
  );
}
