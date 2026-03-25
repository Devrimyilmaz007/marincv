import { getServerDictionary } from "@/lib/dictionaries";
import LoginContent from "./_content";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { locale } = await getServerDictionary();
  return <LoginContent locale={locale} />;
}
