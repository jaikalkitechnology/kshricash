import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import logo from "../../public/logo.png";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  title: string;
  userRole: string;
  /** Optional fixed bottom nav, shown on mobile only (e.g. <MobileBottomNav />) */
  bottomNav?: ReactNode;
}

/** Brand logo tile + wordmark. `tone` controls text color for cream vs teal backgrounds. */
function Brand({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <img src={logo} alt="Kshricash" className="h-7 w-7 rounded-md object-contain" />
      </div>
      <div className="leading-tight">
        <span className={cn("font-display text-lg font-semibold", tone === "light" ? "text-cream" : "text-vasu-deep")}>
          Kshri<span className="text-saffron">cash</span>
        </span>
        <span
          className={cn(
            "block font-mono text-[8px] uppercase tracking-[0.22em]",
            tone === "light" ? "text-vasu-mint" : "text-stone"
          )}
        >
          Digital Seva
        </span>
      </div>
    </div>
  );
}

function getInitials(name?: string, fallback = "U") {
  const n = (name || "").trim();
  if (!n) return fallback;
  const parts = n.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

/** Avatar circle with initials. */
function Avatar({ name, className }: { name?: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-saffron to-saffron-light font-display text-sm font-semibold text-white shadow-sm",
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}

/** The full sidebar panel: brand header + nav + user/logout footer. Reused on desktop + mobile. */
function SidebarPanel({
  sidebar,
  userName,
  userRole,
  onLogout,
  withClose,
}: {
  sidebar: ReactNode;
  userName?: string;
  userRole: string;
  onLogout: () => void;
  withClose?: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Brand tone="light" />
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2">{sidebar}</div>

      {/* User + logout footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <Avatar name={userName} className="h-9 w-9 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-cream">{userName || "Account"}</p>
            <p className="truncate font-mono text-[10px] uppercase tracking-wide text-vasu-mint">{userRole}</p>
          </div>
        </div>
        {withClose ? (
          <SheetClose asChild>
            <button
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-saffron/40 bg-saffron/15 py-2.5 text-sm font-semibold text-saffron-light transition hover:bg-saffron hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </SheetClose>
        ) : (
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-saffron/40 bg-saffron/15 py-2.5 text-sm font-semibold text-saffron-light transition hover:bg-saffron hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        )}
      </div>
    </div>
  );
}

export function DashboardLayout({ children, sidebar, title, userRole, bottomNav }: DashboardLayoutProps) {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* ===== Top bar ===== */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SidebarPanel
                  sidebar={sidebar}
                  userName={user?.full_name}
                  userRole={userRole}
                  onLogout={signOut}
                  withClose
                />
              </SheetContent>
            </Sheet>

            {/* Brand (mobile) + page title (desktop) */}
            <div className="lg:hidden">
              <Brand />
            </div>
            <h1 className="hidden font-display text-xl font-semibold text-vasu-deep lg:block">{title}</h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Bharat Connect mnemonic — top-right on every screen (NPCI requirement) */}
            <img src="/bharat-connect/logo.svg" alt="Bharat Connect" className="h-6 w-auto sm:h-7" />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-saffron ring-2 ring-card" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto gap-2 px-1.5 py-1 sm:px-2">
                  <Avatar name={user?.full_name} className="h-8 w-8" />
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-semibold text-foreground">{user?.full_name || "Account"}</span>
                    <span className="block text-xs text-muted-foreground">{userRole}</span>
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex items-center gap-3 py-2">
                  <Avatar name={user?.full_name} className="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user?.full_name || "Account"}</p>
                    <p className="truncate text-xs font-normal text-muted-foreground">
                      {user?.email || user?.phone || userRole}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ===== Desktop sidebar ===== */}
      <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-64 lg:block">
        <SidebarPanel
          sidebar={sidebar}
          userName={user?.full_name}
          userRole={userRole}
          onLogout={signOut}
        />
      </aside>

      {/* ===== Main ===== */}
      <main className={cn("p-4 sm:p-6 lg:ml-64 lg:p-8", bottomNav && "pb-24 lg:pb-8")}>
        <div className="mb-6 lg:hidden">
          <h2 className="font-display text-2xl font-semibold text-vasu-deep">{title}</h2>
        </div>
        {children}
      </main>

      {bottomNav}
    </div>
  );
}
