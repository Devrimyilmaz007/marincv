import Link from "next/link";
import { Anchor } from "lucide-react";

/* ── Footer Link Groups ─────────────────────────────────────────────────── */
const footerLinks = {
  company: {
    title: "Şirket",
    links: [
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/blog",       label: "Blog"        },
      { href: "/kariyer",    label: "Kariyer"     },
      { href: "/basin",      label: "Basın"       },
    ],
  },
  product: {
    title: "Ürün",
    links: [
      { href: "/adaylar",    label: "Adaylar İçin"    },
      { href: "/isverenler", label: "İşverenler İçin" },
      { href: "/fiyatlar",   label: "Fiyatlandırma"   },
      { href: "/ozellikler", label: "Özellikler"      },
    ],
  },
  legal: {
    title: "Yasal",
    links: [
      { href: "/gizlilik",   label: "Gizlilik Politikası" },
      { href: "/kosullar",   label: "Kullanım Koşulları"  },
      { href: "/cerezler",   label: "Çerez Politikası"    },
      { href: "/iletisim",   label: "İletişim"            },
    ],
  },
};

/* ── Main Deck Footer ───────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer className="bg-primary text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand Column ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight w-fit"
              aria-label="MarinCV Ana Sayfa"
            >
              <Anchor size={20} className="text-accent" aria-hidden="true" />
              <span className="text-white">Marin</span>
              <span className="text-accent">CV</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Denizcilik sektörünün güvenilir İK platformu. Belgeli personelden
              doğrulanmış iş ilanlarına, her şey tek çatı altında.
            </p>
            {/* Social links placeholder */}
            <div className="flex gap-3 mt-1" aria-label="Sosyal medya bağlantıları">
              {["LinkedIn", "Twitter", "Instagram"].map((name) => (
                <a
                  key={name}
                  href="#"
                  aria-label={name}
                  className="w-8 h-8 rounded-md bg-white/10 hover:bg-accent hover:text-primary flex items-center justify-center text-xs font-bold transition-colors duration-150"
                >
                  {name[0]}
                </a>
              ))}
            </div>
          </div>

          {/* ── Link Columns ─────────────────────────────────────────── */}
          {Object.entries(footerLinks).map(([key, group]) => (
            <div key={key} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-accent transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom Bar ───────────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>© 2024 MarinCV. Tüm hakları saklıdır.</span>
          <div className="flex items-center gap-4">
            <Link href="/gizlilik" className="hover:text-accent transition-colors duration-150">
              Gizlilik
            </Link>
            <Link href="/kosullar" className="hover:text-accent transition-colors duration-150">
              Koşullar
            </Link>
            <Link href="/iletisim" className="hover:text-accent transition-colors duration-150">
              İletişim
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
