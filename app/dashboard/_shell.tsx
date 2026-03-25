"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { DashUserProvider, useDashUser } from "./_context";
import type { Locale } from "@/lib/dictionaries";

/* ── SVG Icons ──────────────────────────────────────────────────────────── */
function IconUser()      { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>; }
function IconDocument()  { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>; }
function IconShip()      { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M6 7.5h12M5.25 7.5L3 15.75 12 18l9-2.25-2.25-8.25" /></svg>; }
function IconBriefcase() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>; }
function IconSettings()  { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function IconBuilding()  { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>; }
function IconMegaphone() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>; }
function IconUsers()     { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>; }
function IconSearch()    { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>; }
function IconInbox()     { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" /></svg>; }
function IconLogout()    { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>; }
function IconMenu()      { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>; }
function IconX()         { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>; }

function isEmployer(role: string | undefined) {
  return role === "employer" || role === "agency";
}

function Skeleton({ className }: { className?: string }) {
  return <span className={`block animate-pulse bg-slate-700/60 rounded-md ${className ?? ""}`} />;
}

/* ── Sidebar User Block ─────────────────────────────────────────────────── */
function SidebarUserBlock() {
  const { user, loading, dict } = useDashUser();
  const t = dict.dashboard;
  const router = useRouter();

  const roleLabel = (role: string | undefined) => {
    const map: Record<string, string> = {
      candidate: t.role_label_cand,
      employer:  t.role_label_emp,
      agency:    t.role_label_agency,
    };
    return map[role?.toLowerCase() ?? ""] ?? role ?? "—";
  };

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="px-4 py-4 border-b border-slate-800/60 shrink-0">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-gradient-to-tr ${
          isEmployer(user?.role) ? "from-violet-600 to-purple-400" : "from-blue-600 to-[#00D2FF]"
        }`}>
          {loading ? "…" : (user?.initials ?? "?")}
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <><Skeleton className="h-3.5 w-24 mb-1.5" /><Skeleton className="h-3 w-16" /></>
          ) : (
            <>
              <p className="text-sm font-semibold text-white truncate">{user?.fullName ?? "—"}</p>
              <p className="text-xs text-slate-400 truncate">{roleLabel(user?.role)}</p>
            </>
          )}
        </div>
      </div>

      {!loading && (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
          isEmployer(user?.role)
            ? "bg-violet-500/10 text-violet-300 border-violet-500/20"
            : "bg-[#00D2FF]/10  text-[#00D2FF]  border-[#00D2FF]/20"
        }`}>
          {isEmployer(user?.role) ? <IconBuilding /> : <IconShip />}
          {isEmployer(user?.role) ? t.role_employer : t.role_candidate}
        </span>
      )}

      <button onClick={handleLogout}
        className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer">
        <IconLogout />
        {t.logout}
      </button>
    </div>
  );
}

/* ── Dashboard Shell ─────────────────────────────────────────────────────── */
function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [sideOpen, setSideOpen] = useState(false);
  const { user, loading: userLoading, dict } = useDashUser();
  const t = dict.dashboard;

  const CANDIDATE_NAV = [
    { href: "/dashboard",              label: t.nav_profile,      icon: <IconUser />      },
    { href: "/dashboard/documents",    label: t.nav_documents,    icon: <IconDocument />  },
    { href: "/dashboard/sea-service",  label: t.nav_sea_service,  icon: <IconShip />      },
    { href: "/dashboard/job-board",    label: t.nav_job_board,    icon: <IconSearch />    },
    { href: "/dashboard/applications", label: t.nav_applications, icon: <IconBriefcase /> },
    { href: "/dashboard/settings",     label: t.nav_settings,     icon: <IconSettings />  },
  ];

  const EMPLOYER_NAV = [
    { href: "/dashboard",                       label: t.nav_company,    icon: <IconBuilding />  },
    { href: "/dashboard/jobs",                  label: t.nav_jobs,       icon: <IconMegaphone /> },
    { href: "/dashboard/candidates",            label: t.nav_candidates, icon: <IconUsers />     },
    { href: "/dashboard/incoming-applications", label: t.nav_incoming,   icon: <IconInbox />     },
    { href: "/dashboard/settings",              label: t.nav_settings,   icon: <IconSettings />  },
  ];

  const navItems = userLoading ? [] : isEmployer(user?.role) ? EMPLOYER_NAV : CANDIDATE_NAV;

  return (
    <div className="flex h-screen bg-[#050B14] overflow-hidden">
      {sideOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSideOpen(false)} aria-hidden />
      )}

      <aside className={["fixed top-0 left-0 h-full w-64 bg-[#080F1E] border-r border-slate-800/60 z-30 flex flex-col transition-transform duration-300",
        sideOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"].join(" ")}>

        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800/60 shrink-0">
          <Link href="/" className="text-xl font-black tracking-tighter">
            <span className="text-white">Marin</span><span className="text-[#00D2FF]">CV</span>
          </Link>
          <button className="md:hidden text-slate-400 hover:text-white transition-colors cursor-pointer" onClick={() => setSideOpen(false)}>
            <IconX />
          </button>
        </div>

        <SidebarUserBlock />

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {userLoading ? (
            <div className="flex flex-col gap-1 px-1 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                  <Skeleton className="w-5 h-5 rounded-md shrink-0" /><Skeleton className="h-3.5 flex-1" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const empNav   = isEmployer(user?.role);
                return (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => setSideOpen(false)}
                      className={["flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                        isActive
                          ? empNav ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                                   : "bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60",
                      ].join(" ")}
                      aria-current={isActive ? "page" : undefined}>
                      <span className={isActive ? (empNav ? "text-violet-300" : "text-[#00D2FF]") : "text-slate-500"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-h-0">
        <div className="md:hidden flex items-center gap-4 px-4 h-14 border-b border-slate-800/60 bg-[#080F1E] shrink-0">
          <button className="text-slate-400 hover:text-white transition-colors cursor-pointer" onClick={() => setSideOpen(true)}>
            <IconMenu />
          </button>
          <span className="text-base font-black tracking-tighter">
            <span className="text-white">Marin</span><span className="text-[#00D2FF]">CV</span>
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ── Exported Shell (wraps with Provider) ───────────────────────────────── */
export default function DashboardShellWithProvider({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return (
    <DashUserProvider locale={locale}>
      <DashboardShell>{children}</DashboardShell>
    </DashUserProvider>
  );
}
