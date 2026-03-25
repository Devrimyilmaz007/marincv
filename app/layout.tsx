import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MarinCV | Denizcilik İşe Alımında Yeni Standart',
  description: 'Armatörler ve denizciler için profesyonel İK platformu.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-[#050B14] text-slate-200 antialiased selection:bg-[#00D2FF] selection:text-[#050B14]">
        {children}
      </body>
    </html>
  );
}
