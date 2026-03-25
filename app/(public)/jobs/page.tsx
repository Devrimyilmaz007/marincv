import { getServerDictionary } from "@/lib/dictionaries";
import PublicJobsContent from "./_content";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const { locale } = await getServerDictionary();
  return <PublicJobsContent locale={locale} />;
}
