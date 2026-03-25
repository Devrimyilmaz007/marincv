import { cookies } from "next/headers";
import tr from "@/dictionaries/tr.json";
import en from "@/dictionaries/en.json";

/* ── Supported locales ──────────────────────────────────────────────────── */
const dictionaries = { tr, en } as const;

export type Locale = keyof typeof dictionaries;

/** Full dictionary shape — inferred from the Turkish source of truth */
export type Dictionary = typeof tr;

/** Validate and narrow an unknown string to a supported Locale */
function toLocale(value: string | undefined): Locale {
  return value === "en" ? "en" : "tr";
}

/**
 * Returns the full UI text dictionary for the given locale.
 * Defaults to Turkish ('tr').
 */
export function getDictionary(locale: Locale = "tr"): Dictionary {
  return dictionaries[locale];
}

/**
 * Reads the `locale` cookie and returns the matching dictionary.
 * Use this in Server Components instead of getDictionary('tr').
 *
 * Usage:
 *   const { dict, locale } = await getServerDictionary();
 */
export async function getServerDictionary(): Promise<{
  dict: Dictionary;
  locale: Locale;
}> {
  const cookieStore = await cookies();
  const locale = toLocale(cookieStore.get("locale")?.value);
  return { dict: getDictionary(locale), locale };
}
