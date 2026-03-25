import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser (Client Component) tarafında kullanılacak Supabase istemcisi.
 * Her çağrıda yeni bir instance döner — bileşen içinde useMemo ile saralabilirsin.
 *
 * Kullanım:
 *   const supabase = createClient();
 *   const { error } = await supabase.auth.signUp({ email, password });
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
