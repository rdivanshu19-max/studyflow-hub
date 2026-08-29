import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, FileUp, Library, Plus, Shield, Ticket, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadBookAsset } from "@/lib/storage";
import {
  RESOURCE_KINDS,
  RESOURCE_LABELS,
  booksQuery,
  fetchAllPasses,
  fetchChapters,
  fetchPassBooks,
  fetchResources,
  inr,
  uniqueSorted,
  type Book,
} from "@/lib/catalog";

export function AdminPanel() {
  const { data: books = [] } = useQuery(booksQuery);
  const { data: passes = [] } = useQuery({ queryKey: ["all-passes"], queryFn: fetchAllPasses });
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase text-brand">Admin workspace</p>
        <h1 className="page-title">Content management</h1>
        <p className="text-sm text-muted-foreground">
          Upload books, chapter PDFs, audio, practice/PYQ files and video solutions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Books" value={books.length} icon={BookOpen} />
        <Metric label="Passes" value={passes.length} icon={Ticket} />
        <Metric label="Free titles" value={books.filter((b) => !b.is_paid).length} icon={Library} />
        <Metric label="Subjects" value={uniqueSorted(books.map((b) => b.subject)).length} icon={Shield} />
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Books & content</TabsTrigger>
          <TabsTrigger value="new">New book</TabsTrigger>
          <TabsTrigger value="passes">Passes</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-5">
          <ContentManager books={books} />
        </TabsContent>
        <TabsContent value="new" className="mt-5">
          <NewBookForm />
        </TabsContent>
        <TabsContent value="passes" className="mt-5">
          <PassManager books={books} />
        </TabsContent>
        <TabsContent value="users" className="mt-5">
          <UserManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof BookOpen;
}) {
  return (
    <div className="border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-brand" />
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ContentManager({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [bookId, setBookId] = useState<string | null>(null);
  const filtered = books.filter((b) => b.title.toLowerCase().includes(query.toLowerCase()));
  const selected = books.find((b) => b.id === bookId) ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="space-y-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books…"
        />
        <div className="max-h-[520px] divide-y divide-border overflow-y-auto border border-border bg-card">
          {filtered.slice(0, 200).map((b) => (
            <button
              key={b.id}
              onClick={() => setBookId(b.id)}
              className={`block w-full px-3 py-2.5 text-left text-xs ${
                b.id === bookId ? "bg-brand-soft font-semibold text-brand" : "hover:bg-accent"
              }`}
            >
              <span className="line-clamp-2">{b.title}</span>
              <span className="mt-0.5 block text-[10px] text-muted-foreground">
                {b.subject} · {b.display_class}
              </span>
            </button>
          ))}
        </div>
      </div>
      {selected ? (
        <BookEditor book={selected} />
      ) : (
        <p className="border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Select a book to manage its content.
        </p>
      )}
    </div>
  );
}

function BookEditor({ book }: { book: Book }) {
  const queryClient = useQueryClient();
  const { data: chapters = [] } = useQuery({
    queryKey: ["chapters", book.id],
    queryFn: () => fetchChapters(book.id),
  });
  const { data: resources = [] } = useQuery({
    queryKey: ["resources", book.id],
    queryFn: () => fetchResources(book.id),
  });

  const [chTitle, setChTitle] = useState("");
  const [chNo, setChNo] = useState("");

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["chapters", book.id] });
    await queryClient.invalidateQueries({ queryKey: ["resources", book.id] });
    await queryClient.invalidateQueries({ queryKey: ["books"] });
  };

  const uploadFullBook = useMutation({
    mutationFn: async (file: File) => {
      const path = await uploadBookAsset(file, `books/${book.id}`);
      const { error } = await supabase
        .from("books")
        .update({ content_url: path, content_mode: "PDF" })
        .eq("id", book.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      toast.success("Full book PDF uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addChapter = useMutation({
    mutationFn: async () => {
      if (!chTitle.trim()) throw new Error("Chapter title is required");
      const position = chapters.length + 1;
      const { error } = await supabase.from("chapters").insert({
        book_id: book.id,
        ch_no: chNo.trim() || String(position),
        title: chTitle.trim(),
        position,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setChTitle("");
      setChNo("");
      await refresh();
      toast.success("Chapter added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadChapterPdf = useMutation({
    mutationFn: async ({ chapterId, file }: { chapterId: string; file: File }) => {
      const path = await uploadBookAsset(file, `books/${book.id}/chapters`);
      const { error } = await supabase
        .from("chapters")
        .update({ content_url: path })
        .eq("id", chapterId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      toast.success("Chapter PDF uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteChapter = useMutation({
    mutationFn: async (chapterId: string) => {
      const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <section className="border border-border bg-card p-4">
        <div className="flex items-start gap-4">
          <img src={book.cover_url} alt="" className="h-24 w-18 object-cover" />
          <div className="min-w-0">
            <h2 className="font-bold">{book.title}</h2>
            <p className="text-xs text-muted-foreground">
              {book.subject} · {book.display_class} · {book.is_paid ? inr(book.price) : "Free"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {book.content_url ? "Full-book PDF attached" : "No full-book PDF yet"}
            </p>
            <FilePicker
              label="Upload full book PDF"
              accept="application/pdf"
              busy={uploadFullBook.isPending}
              onPick={(file) => uploadFullBook.mutate(file)}
            />
          </div>
        </div>
      </section>

      <section className="border border-border bg-card p-4">
        <h3 className="font-semibold">Chapters</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            value={chNo}
            onChange={(e) => setChNo(e.target.value)}
            placeholder="No."
            className="w-20"
          />
          <Input
            value={chTitle}
            onChange={(e) => setChTitle(e.target.value)}
            placeholder="Chapter title"
            className="min-w-48 flex-1"
          />
          <Button onClick={() => addChapter.mutate()} disabled={addChapter.isPending}>
            <Plus /> Add chapter
          </Button>
        </div>

        <div className="mt-4 divide-y divide-border border-y border-border">
          {chapters.map((ch) => (
            <div key={ch.id} className="space-y-2 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center bg-surface text-xs font-semibold">
                  {ch.ch_no}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{ch.title}</span>
                <span
                  className={`text-[10px] font-semibold uppercase ${
                    ch.content_url ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {ch.content_url ? "PDF" : "No file"}
                </span>
                <button
                  onClick={() => deleteChapter.mutate(ch.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${ch.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pl-9">
                <FilePicker
                  label="Chapter PDF"
                  accept="application/pdf"
                  busy={uploadChapterPdf.isPending}
                  onPick={(file) => uploadChapterPdf.mutate({ chapterId: ch.id, file })}
                />
                <ResourceUploader bookId={book.id} chapterId={ch.id} onDone={refresh} />
              </div>
              <div className="flex flex-wrap gap-2 pl-9">
                {resources
                  .filter((r) => r.chapter_id === ch.id)
                  .map((r) => (
                    <ResourceChip key={r.id} id={r.id} kind={r.kind} title={r.title} onDone={refresh} />
                  ))}
              </div>
            </div>
          ))}
          {chapters.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">No chapters yet.</p>
          )}
        </div>
      </section>

      <section className="border border-border bg-card p-4">
        <h3 className="font-semibold">Book-level resources</h3>
        <p className="text-xs text-muted-foreground">
          Audio books, practice sets, PYQ papers and video solutions for the whole book.
        </p>
        <div className="mt-3">
          <ResourceUploader bookId={book.id} chapterId={null} onDone={refresh} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {resources
            .filter((r) => !r.chapter_id)
            .map((r) => (
              <ResourceChip key={r.id} id={r.id} kind={r.kind} title={r.title} onDone={refresh} />
            ))}
        </div>
      </section>
    </div>
  );
}

function FilePicker({
  label,
  accept,
  busy,
  onPick,
}: {
  label: string;
  accept: string;
  busy: boolean;
  onPick: (file: File) => void;
}) {
  return (
    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 border border-border bg-surface px-3 py-2 text-xs font-semibold hover:border-brand/50">
      <FileUp className="h-3.5 w-3.5 text-brand" />
      {busy ? "Uploading…" : label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function ResourceUploader({
  bookId,
  chapterId,
  onDone,
}: {
  bookId: string;
  chapterId: string | null;
  onDone: () => Promise<void> | void;
}) {
  const [kind, setKind] = useState<string>("practice");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const save = useMutation({
    mutationFn: async (file?: File) => {
      let finalUrl = url.trim();
      if (file) finalUrl = await uploadBookAsset(file, `books/${bookId}/${kind}`);
      if (!finalUrl) throw new Error("Choose a file or paste a link");
      const { error } = await supabase.from("chapter_resources").insert({
        book_id: bookId,
        chapter_id: chapterId,
        kind,
        title: title.trim() || (RESOURCE_LABELS[kind] ?? kind),
        url: finalUrl,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setTitle("");
      setUrl("");
      await onDone();
      toast.success("Resource added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value)}
        className="h-9 border border-border bg-card px-2 text-xs font-medium outline-none"
      >
        {RESOURCE_KINDS.map((k) => (
          <option key={k} value={k}>
            {RESOURCE_LABELS[k]}
          </option>
        ))}
      </select>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="h-9 w-40"
      />
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Or paste a video / file link"
        className="h-9 w-56"
      />
      <FilePicker
        label="Upload file"
        accept={kind === "video" ? "video/*" : kind === "audio" ? "audio/*" : "application/pdf"}
        busy={save.isPending}
        onPick={(file) => save.mutate(file)}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => save.mutate(undefined)}
        disabled={save.isPending}
      >
        <Upload /> Save link
      </Button>
    </div>
  );
}

function ResourceChip({
  id,
  kind,
  title,
  onDone,
}: {
  id: string;
  kind: string;
  title: string;
  onDone: () => Promise<void> | void;
}) {
  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("chapter_resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <span className="inline-flex items-center gap-2 border border-border bg-surface px-2 py-1 text-[11px]">
      <span className="font-semibold text-brand">{RESOURCE_LABELS[kind] ?? kind}</span>
      <span className="max-w-32 truncate">{title}</span>
      <button onClick={() => remove.mutate()} aria-label="Remove resource">
        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </button>
    </span>
  );
}

function NewBookForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    author: "",
    publisher: "",
    subject: "Physics",
    display_class: "Class 12",
    exams: "IIT-JEE",
    book_type: "NCERT",
    cover_url: "",
    price: "0",
    description: "",
  });
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const create = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Title is required");
      const price = Number(form.price) || 0;
      const { error } = await supabase.from("books").insert({
        title: form.title.trim(),
        author: form.author.trim(),
        publisher: form.publisher.trim(),
        subject: form.subject.trim(),
        display_class: form.display_class.trim(),
        classes: [form.display_class.trim()],
        exams: form.exams
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
        book_type: form.book_type.trim(),
        cover_url: form.cover_url.trim(),
        is_paid: price > 0,
        price,
        description: form.description.trim(),
        no_of_chapters: 0,
        content_mode: "PDF",
        status: "ACTIVE",
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book created — now add chapters and files");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl space-y-3 border border-border bg-card p-5">
      <Field label="Title" value={form.title} onChange={set("title")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Author" value={form.author} onChange={set("author")} />
        <Field label="Publisher" value={form.publisher} onChange={set("publisher")} />
        <Field label="Subject" value={form.subject} onChange={set("subject")} />
        <Field label="Class" value={form.display_class} onChange={set("display_class")} />
        <Field label="Exams (comma separated)" value={form.exams} onChange={set("exams")} />
        <Field label="Book type" value={form.book_type} onChange={set("book_type")} />
        <Field label="Cover image URL" value={form.cover_url} onChange={set("cover_url")} />
        <Field label="Price (0 = free)" value={form.price} onChange={set("price")} />
      </div>
      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Description</span>
        <Textarea
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          className="mt-1 min-h-24"
        />
      </label>
      <Button onClick={() => create.mutate()} disabled={create.isPending}>
        <Plus /> Create book
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
    </label>
  );
}

function PassManager({ books }: { books: Book[] }) {
  const queryClient = useQueryClient();
  const { data: passes = [] } = useQuery({ queryKey: ["all-passes"], queryFn: fetchAllPasses });
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    exam: "IIT-JEE",
    original_price: "0",
    price: "0",
    validity_months: "12",
  });
  const [passId, setPassId] = useState<string | null>(null);
  const [bookQuery, setBookQuery] = useState("");
  const selectedPass = passes.find((p) => p.id === passId) ?? null;

  const { data: passBooks = [] } = useQuery({
    queryKey: ["pass-books", passId],
    enabled: !!passId,
    queryFn: () => (passId ? fetchPassBooks(passId) : Promise.resolve([])),
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Pass title is required");
      const price = Number(form.price) || 0;
      const { error } = await supabase.from("passes").insert({
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        exam: form.exam.trim(),
        original_price: Number(form.original_price) || 0,
        price,
        is_free: price === 0,
        validity_months: Number(form.validity_months) || 12,
        status: "ACTIVE",
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["all-passes"] });
      await queryClient.invalidateQueries({ queryKey: ["passes"] });
      toast.success("Pass created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("passes").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["all-passes"] });
      await queryClient.invalidateQueries({ queryKey: ["passes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleBook = useMutation({
    mutationFn: async ({ bookId, add }: { bookId: string; add: boolean }) => {
      if (!passId) throw new Error("Select a pass first");
      if (add) {
        const { error } = await supabase
          .from("pass_books")
          .upsert({ pass_id: passId, book_id: bookId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pass_books")
          .delete()
          .eq("pass_id", passId)
          .eq("book_id", bookId);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pass-books", passId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const included = new Set(passBooks.map((pb) => pb.book_id));
  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(bookQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <section className="max-w-2xl space-y-3 border border-border bg-card p-5">
        <h3 className="font-semibold">Create a pass</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Title"
            value={form.title}
            onChange={(v) => setForm((f) => ({ ...f, title: v }))}
          />
          <Field
            label="Subtitle"
            value={form.subtitle}
            onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))}
          />
          <Field
            label="Exam"
            value={form.exam}
            onChange={(v) => setForm((f) => ({ ...f, exam: v }))}
          />
          <Field
            label="Validity (months)"
            value={form.validity_months}
            onChange={(v) => setForm((f) => ({ ...f, validity_months: v }))}
          />
          <Field
            label="Original price"
            value={form.original_price}
            onChange={(v) => setForm((f) => ({ ...f, original_price: v }))}
          />
          <Field
            label="Price (0 = free pass)"
            value={form.price}
            onChange={(v) => setForm((f) => ({ ...f, price: v }))}
          />
        </div>
        <Button onClick={() => create.mutate()} disabled={create.isPending}>
          <Plus /> Create pass
        </Button>
      </section>

      <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="divide-y divide-border border border-border bg-card">
          {passes.map((p) => (
            <div key={p.id} className="p-3">
              <button
                onClick={() => setPassId(p.id)}
                className={`block w-full text-left text-sm font-semibold ${
                  p.id === passId ? "text-brand" : ""
                }`}
              >
                {p.title}
              </button>
              <p className="text-[11px] text-muted-foreground">
                {p.is_free ? "Free" : inr(Number(p.price))} · {p.status}
              </p>
              <button
                onClick={() =>
                  toggleStatus.mutate({
                    id: p.id,
                    status: p.status === "ACTIVE" ? "DRAFT" : "ACTIVE",
                  })
                }
                className="mt-1 text-[11px] font-semibold text-brand"
              >
                {p.status === "ACTIVE" ? "Unpublish" : "Publish"}
              </button>
            </div>
          ))}
          {passes.length === 0 && <p className="p-4 text-sm text-muted-foreground">No passes yet.</p>}
        </div>

        {selectedPass ? (
          <div className="space-y-3 border border-border bg-card p-4">
            <h3 className="font-semibold">Books in “{selectedPass.title}”</h3>
            <p className="text-xs text-muted-foreground">{included.size} books included</p>
            <Input
              value={bookQuery}
              onChange={(e) => setBookQuery(e.target.value)}
              placeholder="Search books to include…"
            />
            <div className="max-h-96 divide-y divide-border overflow-y-auto border border-border">
              {filteredBooks.slice(0, 100).map((b) => (
                <label key={b.id} className="flex items-center gap-3 p-2.5 text-xs">
                  <input
                    type="checkbox"
                    checked={included.has(b.id)}
                    onChange={(e) => toggleBook.mutate({ bookId: b.id, add: e.target.checked })}
                  />
                  <span className="min-w-0 flex-1 truncate">{b.title}</span>
                  <span className="text-muted-foreground">{b.subject}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <p className="border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Select a pass to choose its books.
          </p>
        )}
      </section>
    </div>
  );
}

function UserManager() {
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,username,email,exam_category,class_level,is_banned")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id,role");
      if (error) throw error;
      return data ?? [];
    },
  });

  const setAdmin = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      const { error } = await supabase.rpc("set_user_admin", {
        p_user_id: userId,
        p_make_admin: makeAdmin,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("Role updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setBanned = useMutation({
    mutationFn: async ({ userId, banned }: { userId: string; banned: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: banned })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const admins = new Set(roles.filter((r) => r.role === "admin").map((r) => r.user_id));

  return (
    <div className="overflow-x-auto border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface text-xs text-muted-foreground">
          <tr>
            <th className="p-3">Student</th>
            <th className="p-3">Email</th>
            <th className="p-3">Exam</th>
            <th className="p-3">Role</th>
            <th className="p-3">Access</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="p-3 font-medium">{u.full_name || u.username}</td>
              <td className="p-3 text-muted-foreground">{u.email}</td>
              <td className="p-3 text-muted-foreground">
                {u.exam_category} {u.class_level}
              </td>
              <td className="p-3">
                <button
                  onClick={() =>
                    setAdmin.mutate({ userId: u.id, makeAdmin: !admins.has(u.id) })
                  }
                  className="text-xs font-semibold text-brand"
                >
                  {admins.has(u.id) ? "Admin · revoke" : "Make admin"}
                </button>
              </td>
              <td className="p-3">
                <button
                  onClick={() => setBanned.mutate({ userId: u.id, banned: !u.is_banned })}
                  className="text-xs font-semibold text-brand"
                >
                  {u.is_banned ? "Unban" : "Ban"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
