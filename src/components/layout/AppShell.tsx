import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  Compass,
  Home,
  Library,
  LogOut,
  Search,
  Shield,
  Ticket,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useProfile } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PreferencesDialog } from "@/components/PreferencesDialog";

const PLACEHOLDERS = [
  "Search NCERT Physics Class 12…",
  "Search question banks…",
  "Search by subject or exam…",
  "Search chapters and authors…",
];

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/book-pass", label: "Book Pass", icon: Ticket },
  { to: "/my-books", label: "My Books", icon: Library },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [idx, setIdx] = useState(0);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (profile?.full_name || profile?.username || "S").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
          <Link to="/home" className="shrink-0">
            <Logo />
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{ className: "bg-brand-soft text-brand" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/explore"
            className="ml-auto flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs text-muted-foreground md:max-w-sm"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">{PLACEHOLDERS[idx]}</span>
          </Link>
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Account" className="shrink-0">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-brand-light text-sm font-semibold text-brand">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">
                {profile?.full_name || "Student"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPrefsOpen(true)}>
                <BookOpen className="mr-2 h-4 w-4" /> Change preferences
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin">
                    <Shield className="mr-2 h-4 w-4" /> Admin panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card md:hidden">
        <div className="mx-auto flex max-w-md items-stretch">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
              activeProps={{ className: "text-brand" }}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <PreferencesDialog open={prefsOpen} onOpenChange={setPrefsOpen} />
    </div>
  );
}
