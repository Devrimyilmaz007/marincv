import { getServerDictionary } from "@/lib/dictionaries";
import PublicCandidatesContent from "./_content";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const { locale } = await getServerDictionary();
  return <PublicCandidatesContent locale={locale} />;
}
