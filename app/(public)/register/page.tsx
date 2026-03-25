import { getServerDictionary } from "@/lib/dictionaries";
import RegisterContent from "./_content";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const { locale } = await getServerDictionary();
  return <RegisterContent locale={locale} />;
}
