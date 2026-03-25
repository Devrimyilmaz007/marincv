"use server";

import { cookies } from "next/headers";

/**
 * Sets the locale cookie server-side.
 * The layout uses `export const dynamic = "force-dynamic"` so it always
 * re-reads this cookie on the next render triggered by router.refresh().
 */
export async function setLocale(locale: "tr" | "en"): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path:     "/",
    maxAge:   60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
