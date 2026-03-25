"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Locale, Dictionary } from "@/lib/dictionaries";
import trDict from "@/dictionaries/tr.json";
import enDict from "@/dictionaries/en.json";

/* ── Types ──────────────────────────────────────────────────────────────── */
export interface DashUser {
  id:           string;
  email:        string;
  fullName:     string;
  role:         string;
  phone:        string;
  initials:     string;
  seamanBookNo: string;
  birthDate:    string;
  nationality:  string;
  city:         string;
  address:      string;
}

interface DashUserCtx {
  user:    DashUser | null;
  loading: boolean;
  locale:  Locale;
  dict:    Dictionary;
}

/* ── Context ─────────────────────────────────────────────────────────────── */
const DashUserContext = createContext<DashUserCtx>({
  user: null, loading: true, locale: "tr", dict: trDict as Dictionary,
});

export function useDashUser() {
  return useContext(DashUserContext);
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

/* ── Provider ────────────────────────────────────────────────────────────── */
export function DashUserProvider({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const dict = (locale === "en" ? enDict : trDict) as Dictionary;

  const [user,    setUser]    = useState<DashUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        if (!cancelled) setLoading(false);
        return;
      }

      const meta = authUser.user_metadata ?? {};
      let fullName = meta.full_name ?? meta.name ?? "Kullanıcı";
      let role     = meta.role     ?? "candidate";
      let phone    = meta.phone    ?? "";

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, phone, seaman_book_no, birth_date, nationality, city, address")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profile) {
        fullName = profile.full_name ?? fullName;
        role     = profile.role     ?? role;
        phone    = profile.phone    ?? phone;
      }

      if (!cancelled) {
        setUser({
          id:           authUser.id,
          email:        authUser.email ?? "",
          fullName,
          role,
          phone,
          initials:     getInitials(fullName),
          seamanBookNo: profile?.seaman_book_no ?? "",
          birthDate:    profile?.birth_date     ?? "",
          nationality:  profile?.nationality    ?? "Türkiye",
          city:         profile?.city           ?? "",
          address:      profile?.address        ?? "",
        });
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <DashUserContext.Provider value={{ user, loading, locale, dict }}>
      {children}
    </DashUserContext.Provider>
  );
}
