import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Camera,
  Highlighter,
  Library,
  Mic,
  Sparkles,
  Ticket,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BookFlux by Rankers — Your Digital Library for JEE, NEET & Boards" },
      {
        name: "description",
        content:
          "Read your study books digitally, build a personal library, add notes and voice notes, and get instant help from an AI tutor built for JEE, NEET and Board students.",
      },
      { property: "og:title", content: "BookFlux by Rankers — Your Digital Library" },
      {
        property: "og:description",
        content:
          "Your books, your library, your AI study companion. Digital NCERTs, question banks and Book Passes for JEE, NEET and Boards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-14 text-center md:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-brand-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
          <Sparkles className="h-3.5 w-3.5" /> JEE • NEET • BEYOND
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-6xl">
          Your books. Your library.
          <span className="block font-light text-brand">Your AI study companion.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Access your study books digitally, build your personal library, read, highlight, add notes
          and voice notes, and get instant help from an AI Tutor. Capture any question on your
          screen and get it solved instantly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/auth" search={{ mode: "signup" }}>
              Start reading free
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/explore">Browse the library</Link>
          </Button>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <MockCard
            title="Digital reader"
            body="NCERTs and question banks, chapter by chapter, with page bookmarks and jump-to-page."
            icon={BookOpen}
          />
          <MockCard
            title="Notes & voice notes"
            body="Attach written notes or record a quick voice note on any page or chapter."
            icon={Mic}
          />
          <MockCard
            title="Capture & solve"
            body="Snap a question from your book and get a clean step-by-step solution."
            icon={Camera}
          />
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              An AI tutor that knows the page you're on
            </h2>
            <p className="mt-4 text-muted-foreground">
              Ask for a simpler explanation, a step-by-step walkthrough, or a quick concept recap —
              all in the context of the chapter you're reading, without leaving the book.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-foreground">
              <Bullet icon={Highlighter}>Highlights, notes and bookmarks per chapter</Bullet>
              <Bullet icon={Library}>A personal library that remembers your progress</Bullet>
              <Bullet icon={Ticket}>Book Pass unlocks every premium title at one price</Bullet>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-brand-soft p-6">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ask AI · Physics Part 1, Ch. 4
              </p>
              <p className="mt-3 rounded-lg bg-surface p-3 text-sm text-foreground">
                Explain the right-hand thumb rule with a simple example.
              </p>
              <p className="mt-3 rounded-lg bg-brand-light p-3 text-sm text-foreground">
                Point your right thumb along the current. Your curled fingers show the direction of
                the magnetic field circling the wire — so for an upward current, the field runs
                anticlockwise seen from above.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          One Book Pass. Your whole syllabus.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          NCERTs, modules, question banks, handwritten notes and solutions — bundled for your exam
          and class.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/auth" search={{ mode: "signup" }}>
            Create your free account
          </Link>
        </Button>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <Logo />
          <p>© {new Date().getFullYear()} BookFlux by Rankers. Your Digital Library.</p>
        </div>
      </footer>
    </div>
  );
}

function MockCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: typeof BookOpen;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Bullet({ icon: Icon, children }: { icon: typeof BookOpen; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
      <span>{children}</span>
    </li>
  );
}
