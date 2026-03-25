/**
 * Merkezi gemi tipi ve rütbe sabitleri.
 * Tüm formlar, filtreler ve badge renkler buradan import eder.
 */

/* ── Ship / Vessel Types ─────────────────────────────────────────────────── */
export const SHIP_TYPES = [
  /* Ticari Gemiler */
  "Kuru Yük",
  "Kimyasal Tanker",
  "Ham Petrol Tankeri",
  "Ürün Tankeri",
  "LNG Tankeri",
  "LPG Tankeri",
  "Ro-Ro",
  "Konteyner",
  "Yolcu Gemisi",
  "Dökme Yük",
  "Balıkçı Teknesi",
  "Offshore Destek",
  "Römorkör",
  /* Yatçılık */
  "Motoryat",
  "Gulet",
  "Katamaran",
  "Yelkenli",
  "Charter / Ticari Yat",
  /* Diğer */
  "Diğer",
] as const;

export type ShipType = (typeof SHIP_TYPES)[number];

/* ── Rank Presets ────────────────────────────────────────────────────────── */
export const RANK_PRESETS = [
  /* Köprüüstü */
  "Uzak Yol Kaptanı",
  "Yakın Yol Kaptanı",
  "1. Zabita (Güverte)",
  "2. Zabita (Güverte)",
  "3. Zabita (Güverte)",
  /* Makine */
  "Baş Makinist",
  "2. Makinist",
  "3. Makinist",
  "4. Makinist",
  "Elektrik Zabiti",
  /* Tayfa */
  "Baş Yağcı",
  "Yağcı",
  "Gemici",
  "Tayfa",
  "Aşçı",
  /* Yatçılık */
  "Kaptan (Yat)",
  "Host / Hostes",
  "Yat Aşçısı",
  "Gemici (Yat)",
  /* Diğer */
  "Diğer...",
] as const;

export type Rank = (typeof RANK_PRESETS)[number];

/* ── Ship Type → Tailwind Gradient ──────────────────────────────────────── */
export const TYPE_COLOR: Record<string, string> = {
  /* Ticari Gemiler */
  "Kimyasal Tanker":    "from-orange-600  to-amber-500",
  "Ham Petrol Tankeri": "from-yellow-700  to-yellow-500",
  "Ürün Tankeri":       "from-amber-600   to-yellow-400",
  "LNG Tankeri":        "from-sky-600     to-cyan-400",
  "LPG Tankeri":        "from-teal-600    to-emerald-400",
  "Kuru Yük":           "from-slate-600   to-slate-400",
  "Dökme Yük":          "from-stone-600   to-stone-400",
  "Ro-Ro":              "from-blue-600    to-blue-400",
  "Konteyner":          "from-indigo-600  to-violet-400",
  "Yolcu Gemisi":       "from-pink-600    to-rose-400",
  "Offline Destek":     "from-green-600   to-emerald-400",
  "Offshore Destek":    "from-green-600   to-emerald-400",
  "Römorkör":           "from-red-600     to-rose-400",
  /* Yatçılık — lüks/deniz tonları */
  "Motoryat":           "from-yellow-500  to-amber-300",
  "Gulet":              "from-teal-500    to-cyan-400",
  "Katamaran":          "from-cyan-500    to-sky-300",
  "Yelkenli":           "from-violet-500  to-purple-400",
  "Charter / Ticari Yat": "from-rose-500  to-pink-400",
};

/** Gemi tipine karşılık gradient string döner; bilinmeyenler için slate fallback. */
export function typeGradient(shipType: string): string {
  return TYPE_COLOR[shipType] ?? "from-slate-600 to-slate-400";
}
