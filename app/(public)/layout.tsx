import { getServerDictionary } from '@/lib/dictionaries';
import PublicHeader from '@/components/PublicHeader';

// Always re-render on every request so the locale cookie is always fresh
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { dict, locale } = await getServerDictionary();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader dict={dict.nav} locale={locale} />

      <main className="flex-grow pt-20">
        {children}
      </main>
    </div>
  );
}
