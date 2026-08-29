import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CLASSES, EXAMS } from "@/components/PreferencesDialog";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in | BookFlux by Rankers" },
      {
        name: "description",
        content:
          "Sign in or create your BookFlux by Rankers account to access your digital study library, notes and AI Tutor.",
      },
      { property: "og:title", content: "Sign in to BookFlux by Rankers" },
      {
        property: "og:description",
        content: "Your books, your library, your AI study companion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [coaching, setCoaching] = useState("");
  const [category, setCategory] = useState(EXAMS[1] ?? "IIT-JEE");
  const [klass, setKlass] = useState("Class 11");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  async function bootstrap() {
    const { error } = await supabase.rpc("bootstrap_profile", {
      p_full_name: fullName,
      p_username: username,
      p_coaching: coaching,
      p_category: category,
      p_class: klass,
    });
    if (error) console.error(error);
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/home", replace: true });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      toast.error("Name and username are required");
      return;
    }
    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setBusy(false);
        toast.error(signInError.message);
        return;
      }
    }
    await bootstrap();
    setBusy(false);
    toast.success("Your library is ready");
    navigate({ to: "/home", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-banner p-10 text-banner-foreground lg:flex">
        <Link to="/">
          <Logo />
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Your books. Your library. Your AI study companion.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-banner-muted">
            Read digital textbooks, highlight key ideas, save text and voice notes, and get instant
            help from the BookFlux AI Tutor.
          </p>
        </div>
        <p className="text-xs text-banner-muted">BookFlux by Rankers</p>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Welcome to BookFlux</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in or create an account — no email verification needed.
          </p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                Create account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="mt-5 space-y-4">
                <Field label="Email">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Password">
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <Input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                    />
                  </Field>
                  <Field label="Username">
                    <Input
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="rankers_2027"
                    />
                  </Field>
                </div>
                <Field label="Email">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Password">
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </Field>
                <Field label="Coaching institute (optional)">
                  <Input
                    value={coaching}
                    onChange={(e) => setCoaching(e.target.value)}
                    placeholder="e.g. Rankers Study Space"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Category">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-10 w-full border border-border bg-card px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                    >
                      {EXAMS.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Class">
                    <select
                      value={klass}
                      onChange={(e) => setKlass(e.target.value)}
                      className="h-10 w-full border border-border bg-card px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                    >
                      {CLASSES.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Creating account…" : "Create my library"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
