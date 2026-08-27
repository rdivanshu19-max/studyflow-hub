import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Bot,
  Check,
  FileText,
  Highlighter,
  Mic,
  Play,
  Square,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/hooks/useAuth";
import { resolveUrl, uploadVoiceNote, VOICE_BUCKET } from "@/lib/storage";
import {
  fetchBook,
  fetchChapters,
  fetchHighlights,
  fetchNotes,
  fetchResources,
  RESOURCE_LABELS,
} from "@/lib/catalog";

const COLORS = [
  { key: "yellow", className: "bg-[oklch(0.93_0.14_95)]" },
  { key: "green", className: "bg-[oklch(0.9_0.12_150)]" },
  { key: "blue", className: "bg-[oklch(0.9_0.09_240)]" },
  { key: "pink", className: "bg-[oklch(0.9_0.1_5)]" },
];

export function ReaderView({ bookId, chapterId }: { bookId: string; chapterId?: string }) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  const { data: book } = useQuery({ queryKey: ["book", bookId], queryFn: () => fetchBook(bookId) });
  const { data: chapters = [] } = useQuery({
    queryKey: ["chapters", bookId],
    queryFn: () => fetchChapters(bookId),
  });
  const { data: resources = [] } = useQuery({
    queryKey: ["resources", bookId],
    queryFn: () => fetchResources(bookId),
  });

  const selected = chapters.find((c) => c.id === chapterId) ?? chapters[0];
  const selectedId = selected?.id ?? null;

  const { data: notes = [] } = useQuery({
    queryKey: ["notes", bookId, selectedId, userId],
    enabled: !!userId,
    queryFn: () => fetchNotes(bookId, selectedId),
  });
  const { data: highlights = [] } = useQuery({
    queryKey: ["highlights", bookId, selectedId, userId],
    enabled: !!userId,
    queryFn: () => fetchHighlights(bookId, selectedId),
  });

  const source = selected?.content_url || book?.content_url || null;
  const [docUrl, setDocUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setDocUrl(null);
    resolveUrl(source).then((url) => {
      if (live) setDocUrl(url);
    });
    return () => {
      live = false;
    };
  }, [source]);

  const chapterResources = useMemo(
    () => resources.filter((r) => !r.chapter_id || r.chapter_id === selectedId),
    [resources, selectedId],
  );

  const [quote, setQuote] = useState("");
  const [color, setColor] = useState("yellow");
  const [note, setNote] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const captureSelection = useCallback(() => {
    const text = window.getSelection()?.toString().trim();
    if (text) setQuote(text.slice(0, 500));
  }, []);

  const saveHighlight = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Please sign in");
      if (!quote.trim()) throw new Error("Select or type the text to highlight");
      const { error } = await supabase.from("highlights").insert({
        user_id: userId,
        book_id: bookId,
        chapter_id: selectedId,
        quote: quote.trim(),
        color,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setQuote("");
      await queryClient.invalidateQueries({ queryKey: ["highlights", bookId] });
      toast.success("Highlight saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveNote = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Please sign in");
      if (!note.trim()) throw new Error("Write a note first");
      const { error } = await supabase.from("notes").insert({
        user_id: userId,
        book_id: bookId,
        chapter_id: selectedId,
        kind: "note",
        body: note.trim(),
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["notes", bookId] });
      toast.success("Note saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveVoiceNote = useMutation({
    mutationFn: async (blob: Blob) => {
      if (!userId) throw new Error("Please sign in");
      const path = await uploadVoiceNote(userId, blob);
      const { error } = await supabase.from("notes").insert({
        user_id: userId,
        book_id: bookId,
        chapter_id: selectedId,
        kind: "voice",
        body: "Voice note",
        audio_url: path,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes", bookId] });
      toast.success("Voice note saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeItem = useMutation({
    mutationFn: async ({ table, id }: { table: "notes" | "highlights"; id: string }) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes", bookId] });
      await queryClient.invalidateQueries({ queryKey: ["highlights", bookId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function bookmark() {
    if (!userId) return toast.error("Please sign in");
    const { error } = await supabase.from("bookmarks").insert({
      user_id: userId,
      book_id: bookId,
      chapter_id: selectedId,
      label: selected?.title ?? "Bookmark",
    });
    if (error) toast.error(error.message);
    else toast.success("Bookmarked this chapter");
  }

  function askTutor() {
    if (!question.trim()) return;
    setAnswer(
      "Start by writing down what is given and what is asked. Identify the concept this question tests, write the governing formula, substitute the values carefully and check the units at the end. Highlight the step you get stuck on and I will expand it.",
    );
  }

  return (
    <div className="-mx-4 -my-4 min-h-[calc(100vh-8rem)] bg-reader md:mx-0 md:my-0">
      <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-[250px_1fr_340px]">
        <aside className="hidden border-r border-border bg-card p-4 lg:block">
          <p className="text-xs font-bold uppercase text-brand">Contents</p>
          <h2 className="mt-2 line-clamp-2 font-semibold">{book?.title}</h2>
          <div className="mt-4 max-h-[70vh] space-y-1 overflow-y-auto pr-1">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                to="/read/$bookId"
                params={{ bookId }}
                search={{ chapter: ch.id }}
                className={`block px-3 py-2 text-xs ${
                  ch.id === selectedId
                    ? "bg-brand-soft font-semibold text-brand"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {ch.ch_no}. {ch.title}
              </Link>
            ))}
          </div>
        </aside>

        <main className="p-3 md:p-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{book?.title}</p>
                <h1 className="truncate text-sm font-bold">
                  {selected?.title || "Digital reader"}
                </h1>
              </div>
              <Button variant="outline" size="sm" onClick={bookmark}>
                <Bookmark /> Bookmark
              </Button>
            </div>

            {chapterResources.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {chapterResources.map((r) => (
                  <ResourceChip key={r.id} kind={r.kind} title={r.title} url={r.url} />
                ))}
              </div>
            )}

            {docUrl ? (
              <iframe
                src={docUrl}
                title={selected?.title || book?.title || "Chapter"}
                className="h-[80vh] w-full border border-border bg-card"
              />
            ) : (
              <article
                onMouseUp={captureSelection}
                onTouchEnd={captureSelection}
                className="reader-page min-h-[70vh] bg-card p-7 shadow-lg md:p-12"
              >
                <p className="text-xs font-bold uppercase text-brand">
                  Chapter {selected?.ch_no || 1}
                </p>
                <h2 className="mt-3 text-2xl font-bold">{selected?.title || "Introduction"}</h2>
                <p className="mt-6 leading-8 text-foreground/80">
                  Select any sentence on this page to capture it as a highlight, or attach a text or
                  voice note to this chapter. When the admin uploads the chapter PDF, it appears here
                  in place of this reading surface.
                </p>
                <div className="my-8 border-l-4 border-brand bg-brand-soft p-5">
                  <p className="font-semibold">Key concept</p>
                  <p className="mt-2 text-sm leading-6">
                    Every complex problem becomes easier when it is separated into known information,
                    the governing principle and a clear sequence of steps.
                  </p>
                </div>
                <h3 className="text-lg font-bold">Study with the tools</h3>
                <p className="mt-3 leading-8 text-foreground/80">
                  Highlights, notes and voice notes are saved per chapter, so your revision stays
                  organised across the whole book.
                </p>
              </article>
            )}
          </div>
        </main>

        <aside className="border-t border-border bg-card p-4 lg:border-l lg:border-t-0">
          <Tabs defaultValue="highlights">
            <TabsList className="w-full">
              <TabsTrigger value="highlights" className="flex-1">
                <Highlighter /> Marks
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">
                <FileText /> Notes
              </TabsTrigger>
              <TabsTrigger value="tutor" className="flex-1">
                <Bot /> Tutor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="highlights" className="mt-4 space-y-3">
              <Textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Selected text appears here…"
                className="min-h-24"
              />
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setColor(c.key)}
                    aria-label={`${c.key} highlight`}
                    className={`h-7 w-7 border ${c.className} ${
                      color === c.key ? "border-brand ring-2 ring-brand/40" : "border-border"
                    }`}
                  />
                ))}
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={() => saveHighlight.mutate()}
                  disabled={saveHighlight.isPending}
                >
                  <Highlighter /> Save
                </Button>
              </div>
              <div className="space-y-2">
                {highlights.map((h) => (
                  <div key={h.id} className="border border-border bg-surface p-3">
                    <p className="text-sm leading-6">{h.quote}</p>
                    <button
                      onClick={() => removeItem.mutate({ table: "highlights", id: h.id })}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                ))}
                {highlights.length === 0 && (
                  <p className="text-xs text-muted-foreground">No highlights in this chapter yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4 space-y-3">
              <VoiceRecorder
                onRecorded={(blob) => saveVoiceNote.mutate(blob)}
                busy={saveVoiceNote.isPending}
              />
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for this chapter…"
                className="min-h-28"
              />
              <Button
                className="w-full"
                onClick={() => saveNote.mutate()}
                disabled={saveNote.isPending}
              >
                <Check /> Save note
              </Button>
              <div className="space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="border border-border bg-surface p-3">
                    {n.kind === "voice" && n.audio_url ? (
                      <VoiceNotePlayer path={n.audio_url} />
                    ) : (
                      <p className="text-sm leading-6">{n.body}</p>
                    )}
                    <button
                      onClick={() => removeItem.mutate({ table: "notes", id: n.id })}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-xs text-muted-foreground">No notes in this chapter yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tutor" className="mt-4 space-y-3">
              <div className="bg-brand-soft p-4">
                <Bot className="h-5 w-5 text-brand" />
                <p className="mt-2 text-sm font-semibold">Ask about this chapter</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Get a clear, step-by-step explanation.
                </p>
              </div>
              {answer && (
                <p className="border border-border bg-surface p-3 text-sm leading-6">{answer}</p>
              )}
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like explained?"
                className="min-h-24"
              />
              <Button className="w-full" onClick={askTutor}>
                <Bot /> Ask AI Tutor
              </Button>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}

function ResourceChip({ kind, title, url }: { kind: string; title: string; url: string }) {
  const [href, setHref] = useState<string | null>(null);
  useEffect(() => {
    resolveUrl(url).then(setHref);
  }, [url]);
  const Icon = kind === "video" ? Video : kind === "audio" ? Play : FileText;
  return (
    <a
      href={href ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:border-brand/50"
    >
      <Icon className="h-3.5 w-3.5 text-brand" />
      {title || RESOURCE_LABELS[kind] || kind}
    </a>
  );
}

function VoiceNotePlayer({ path }: { path: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    resolveUrl(path, VOICE_BUCKET).then(setSrc);
  }, [path]);
  if (!src) return <p className="text-xs text-muted-foreground">Loading voice note…</p>;
  return <audio controls src={src} className="w-full" />;
}

function VoiceRecorder({
  onRecorded,
  busy,
}: {
  onRecorded: (blob: Blob) => void;
  busy: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) onRecorded(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error("Microphone permission is required for voice notes");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  return (
    <Button
      variant={recording ? "destructive" : "outline"}
      className="w-full"
      onClick={recording ? stop : start}
      disabled={busy}
    >
      {recording ? <Square /> : <Mic />}
      {recording ? "Stop recording" : busy ? "Saving voice note…" : "Record voice note"}
    </Button>
  );
}

export function ReaderSearchInput() {
  return <Input placeholder="Search" />;
}
