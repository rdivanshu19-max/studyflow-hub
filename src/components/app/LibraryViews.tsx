import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Bookmark, Bot, Check, ChevronRight, CirclePlay, Headphones, Highlighter, Library, Mic, Search, Sparkles, Ticket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BookGrid } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { booksQuery, fetchBook, fetchBooks, fetchChapters, fetchLibrary, fetchPasses, inr, uniqueSorted, type Book } from "@/lib/catalog";
import { useProfile, useSession } from "@/hooks/useAuth";

export function PassBanner({ compact = false }: { compact?: boolean }) {
  const { data: passes = [] } = useQuery({ queryKey: ["passes"], queryFn: fetchPasses });
  const pass = passes[0];
  return (
    <section className="pass-banner overflow-hidden border border-banner-border bg-banner text-banner-foreground">
      <div className="relative z-10 max-w-xl p-5 md:p-8">
        <p className="text-xs font-semibold uppercase text-pass-accent">BookFlux by Rankers</p>
        <h2 className={`${compact ? "mt-1 text-xl" : "mt-2 text-2xl md:text-4xl"} font-bold`}>{pass?.title || "JEE Digital Books Pass"}</h2>
        <p className="mt-2 text-sm text-banner-muted">One pass · 21 digital books · one year validity</p>
        {!compact && <p className="mt-4 max-w-md text-sm text-banner-muted">NCERT, modules, question banks, handwritten notes and solutions—your complete syllabus in one library.</p>}
        <div className="mt-5 flex items-center gap-3">
          <Button asChild size="sm" className="bg-pass-accent text-pass-accent-foreground hover:bg-pass-accent/90"><Link to="/book-pass">View pass</Link></Button>
          {pass && <span className="text-sm font-semibold">From {inr(Number(pass.price))}</span>}
        </div>
      </div>
      <div className="pass-grid absolute inset-0 opacity-30" />
    </section>
  );
}

export function HomeView() {
  const { data: books = [], isLoading } = useQuery(booksQuery);
  const { data: profile } = useProfile();
  const recommended = useMemo(() => {
    const exam = profile?.exam_category;
    const klass = profile?.class_level;
    const matched = books.filter((b) => !exam || b.exams.includes(exam) || (!!klass && b.classes.includes(klass)));
    return (matched.length ? matched : books).slice(0, 12);
  }, [books, profile]);
  return <div className="space-y-7"><div><p className="text-sm text-muted-foreground">Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</p><h1 className="page-title">Your study library</h1></div><PassBanner /><section><SectionHead title="Continue reading" action="My books" to="/my-books" /><div className="grid gap-3 sm:grid-cols-2"><ContinueCard book={books[0]} percent={38} /><ContinueCard book={books[1]} percent={67} /></div></section><section><SectionHead title="Recommended for you" action="Explore all" to="/explore" />{isLoading ? <GridSkeleton /> : <BookGrid books={recommended} />}</section></div>;
}

function ContinueCard({ book, percent }: { book?: Book | undefined; percent: number }) {
  if (!book) return null;
  return <Link to="/books/$bookId" params={{ bookId: book.id }} className="flex items-center gap-3 border border-border bg-card p-3 hover:border-brand/40"><img src={book.cover_url} alt="" className="h-20 w-14 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{book.title}</p><p className="mt-1 text-xs text-muted-foreground">Chapter 2 · Last read recently</p><Progress value={percent} className="mt-4 h-1.5" /><p className="mt-1 text-[10px] text-muted-foreground">{percent}% complete</p></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>;
}

export function ExploreView() {
  const { data: books = [], isLoading } = useQuery(booksQuery);
  const [query, setQuery] = useState(""); const [subject, setSubject] = useState("All"); const [klass, setKlass] = useState("All"); const [type, setType] = useState("All");
  const subjects = uniqueSorted(books.map((b) => b.subject)); const classes = uniqueSorted(books.flatMap((b) => b.classes)); const types = uniqueSorted(books.map((b) => b.book_type));
  const filtered = books.filter((b) => { const hay = `${b.title} ${b.author} ${b.publisher} ${b.subject}`.toLowerCase(); return hay.includes(query.toLowerCase()) && (subject === "All" || b.subject === subject) && (klass === "All" || b.classes.includes(klass)) && (type === "All" || b.book_type === type); });
  return <div className="space-y-5"><div><h1 className="page-title">Explore books</h1><p className="text-sm text-muted-foreground">Find the right book for your exam and class.</p></div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search books, subjects or authors" className="h-11 bg-card pl-10" /></div><div className="flex gap-2 overflow-x-auto pb-1"><Filter label="Subject" value={subject} values={subjects} set={setSubject} /><Filter label="Class" value={klass} values={classes} set={setKlass} /><Filter label="Access" value={type} values={types} set={setType} /></div><div className="flex items-end justify-between"><div><h2 className="text-lg font-bold">All books</h2><p className="text-xs text-muted-foreground">{filtered.length} titles</p></div></div>{isLoading ? <GridSkeleton /> : <BookGrid books={filtered} />}</div>;
}

function Filter({ label, value, values, set }: { label: string; value: string; values: string[]; set: (v: string) => void }) {
  return <label className="shrink-0"><span className="sr-only">{label}</span><select value={value} onChange={(e) => set(e.target.value)} className="h-9 border border-border bg-card px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-ring"><option value="All">{label}: All</option>{values.map((v) => <option key={v}>{v}</option>)}</select></label>;
}

export function MyBooksView() {
  const { session } = useSession();
  const { data = [], isLoading } = useQuery({ queryKey: ["library", session?.user.id], enabled: !!session, queryFn: () => session ? fetchLibrary(session.user.id) : Promise.resolve([]) });
  return <div className="space-y-6"><div><h1 className="page-title">My books</h1><p className="text-sm text-muted-foreground">Purchased and saved books in one place.</p></div><PassBanner compact />{isLoading ? <GridSkeleton /> : data.length ? <BookGrid books={data.map((item) => item.books)} /> : <EmptyLibrary />}</div>;
}

function EmptyLibrary() { return <div className="border border-dashed border-border bg-card px-5 py-14 text-center"><Library className="mx-auto h-9 w-9 text-muted-foreground" /><h2 className="mt-3 font-semibold">Your library is ready</h2><p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Add any free book or unlock a complete Book Pass.</p><Button asChild className="mt-5"><Link to="/explore">Explore books</Link></Button></div>; }

export function BookPassView() {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const { data: passes = [] } = useQuery({ queryKey: ["passes"], queryFn: fetchPasses });
  const { data: myPasses = [] } = useQuery({
    queryKey: ["my-passes", session?.user.id],
    enabled: !!session,
    queryFn: () => (session ? fetchMyPasses(session.user.id) : Promise.resolve([])),
  });
  const activate = useMutation({
    mutationFn: async (passId: string) => {
      if (!session) throw new Error("Please sign in");
      await activatePass(passId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-passes"] });
      await queryClient.invalidateQueries({ queryKey: ["library"] });
      toast.success("Pass activated — books added to My Books");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="page-title">Book Passes</h1>
        <p className="text-sm text-muted-foreground">
          Activate a pass to unlock every book inside it for the full validity period.
        </p>
      </div>
      {passes.map((pass) => (
        <PassCard
          key={pass.id}
          pass={pass as unknown as Pass}
          owned={myPasses.some((p) => p.pass_id === pass.id)}
          busy={activate.isPending}
          onActivate={() => activate.mutate(pass.id)}
        />
      ))}
      {passes.length === 0 && (
        <p className="border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No passes are published yet.
        </p>
      )}
    </div>
  );
}

function PassCard({
  pass,
  owned,
  busy,
  onActivate,
}: {
  pass: Pass;
  owned: boolean;
  busy: boolean;
  onActivate: () => void;
}) {
  const { data: passBooks = [] } = useQuery({
    queryKey: ["pass-books", pass.id],
    queryFn: () => fetchPassBooks(pass.id),
  });
  return (
    <section className="space-y-5">
      <div className="pass-banner relative overflow-hidden border border-banner-border bg-banner p-6 text-center text-banner-foreground md:p-10">
        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase text-pass-accent">
            {pass.exam || "Complete library"}
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-5xl">{pass.title}</h2>
          <p className="mt-3 text-banner-muted">
            {passBooks.length} books · {pass.validity_months || 12} months · Unlimited learning
          </p>
          <div className="mx-auto mt-7 grid max-w-md grid-cols-2 border border-banner-border bg-banner-soft p-4">
            <div>
              <p className="text-xs text-banner-muted">Without pass</p>
              <p className="mt-1 text-xl text-banner-muted line-through">
                {inr(Number(pass.original_price || 0))}
              </p>
            </div>
            <div className="border-l border-banner-border">
              <p className="text-xs text-pass-accent">With pass</p>
              <p className="mt-1 text-3xl font-bold text-pass-accent">
                {pass.is_free ? "Free" : inr(Number(pass.price))}
              </p>
            </div>
          </div>
          <Button
            className="mt-6 w-full max-w-md bg-pass-accent text-pass-accent-foreground hover:bg-pass-accent/90"
            disabled={owned || busy}
            onClick={onActivate}
          >
            {owned ? (
              <>
                <Check /> Pass active
              </>
            ) : (
              <>
                <Ticket /> {pass.is_free ? "Activate free pass" : `Unlock for ${inr(Number(pass.price))}`}
              </>
            )}
          </Button>
        </div>
        <div className="pass-grid absolute inset-0 opacity-30" />
      </div>
      <div>
        <SectionHead title="Books included" />
        <BookGrid books={passBooks.map((pb) => pb.books)} />
      </div>
    </section>
  );
}


export function BookDetailView({ bookId }: { bookId: string }) {
  const queryClient = useQueryClient(); const { session } = useSession();
  const { data: book } = useQuery({ queryKey: ["book", bookId], queryFn: () => fetchBook(bookId) });
  const { data: chapters = [] } = useQuery({ queryKey: ["chapters", bookId], queryFn: () => fetchChapters(bookId) });
  const add = useMutation({ mutationFn: async () => { if (!session) throw new Error("Please sign in"); const { error } = await supabase.from("library_items").upsert({ user_id: session.user.id, book_id: bookId }); if (error) throw error; }, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["library"] }); toast.success("Added to My Books"); }, onError: (e) => toast.error(e.message) });
  if (!book) return <GridSkeleton />;
  return <div className="space-y-7"><section className="grid gap-6 border-b border-border pb-7 sm:grid-cols-[180px_1fr]"><img src={book.cover_url} alt={`${book.title} cover`} className="mx-auto aspect-[3/4] w-40 object-cover shadow-lg sm:mx-0 sm:w-full" /><div><p className="text-xs font-semibold uppercase text-brand">{book.book_type} · {book.subject}</p><h1 className="mt-2 text-2xl font-bold md:text-3xl">{book.title}</h1><p className="mt-2 text-sm text-muted-foreground">{book.author || book.publisher}</p><p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">{book.description || `A complete digital edition with ${chapters.length || book.no_of_chapters} chapters, bookmarks, notes and AI study support.`}</p><div className="mt-6 flex flex-wrap gap-2"><Button asChild><Link to="/read/$bookId" params={{ bookId }}><BookOpen /> Start reading</Link></Button><Button variant="outline" onClick={() => add.mutate()} disabled={add.isPending}><Library /> Add to library</Button></div></div></section><section><div className="mb-3 flex items-end justify-between"><div><h2 className="text-lg font-bold">Chapters</h2><p className="text-xs text-muted-foreground">{chapters.length} chapters</p></div></div><div className="divide-y divide-border border-y border-border">{chapters.map((ch, index) => <Link key={ch.id} to="/read/$bookId" params={{ bookId }} search={{ chapter: ch.id }} className="flex items-center gap-3 py-3 hover:bg-accent/40"><span className="grid h-8 w-8 shrink-0 place-items-center bg-surface text-xs font-semibold">{ch.ch_no || index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-medium">{ch.title}</span><CirclePlay className="h-4 w-4 text-brand" /></Link>)}</div></section></div>;
}

export function AdminView() {
  const { data: books = [] } = useQuery(booksQuery); const { data: passes = [] } = useQuery({ queryKey: ["passes"], queryFn: fetchPasses });
  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase text-brand">Admin workspace</p><h1 className="page-title">Content overview</h1></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Metric label="Active books" value={books.length} icon={BookOpen} /><Metric label="Passes" value={passes.length} icon={Ticket} /><Metric label="Free titles" value={books.filter((b) => !b.is_paid).length} icon={Library} /><Metric label="Subjects" value={uniqueSorted(books.map((b) => b.subject)).length} icon={Bookmark} /></div><section><SectionHead title="Catalogue management" /><div className="overflow-x-auto border border-border bg-card"><table className="w-full text-left text-sm"><thead className="bg-surface text-xs text-muted-foreground"><tr><th className="p-3">Book</th><th className="p-3">Subject</th><th className="p-3">Access</th><th className="p-3">Chapters</th></tr></thead><tbody className="divide-y divide-border">{books.slice(0, 20).map((book) => <tr key={book.id}><td className="p-3 font-medium">{book.title}</td><td className="p-3 text-muted-foreground">{book.subject}</td><td className="p-3">{book.is_paid ? inr(book.price) : "Free"}</td><td className="p-3">{book.no_of_chapters}</td></tr>)}</tbody></table></div></section></div>;
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof BookOpen }) { return <div className="border border-border bg-card p-4"><Icon className="h-5 w-5 text-brand" /><p className="mt-4 text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>; }
function SectionHead({ title, action, to }: { title: string; action?: string; to?: "/explore" | "/my-books" }) { return <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2>{action && to && <Link to={to} className="text-xs font-semibold text-brand">{action} →</Link>}</div>; }
function GridSkeleton() { return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse bg-muted" />)}</div>; }
