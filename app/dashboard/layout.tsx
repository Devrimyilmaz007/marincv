import { getServerDictionary } from "@/lib/dictionaries";
import DashboardShellWithProvider from "./_shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getServerDictionary();
  return <DashboardShellWithProvider locale={locale}>{children}</DashboardShellWithProvider>;
}
