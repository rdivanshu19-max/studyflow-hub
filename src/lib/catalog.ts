import { supabase } from "@/integrations/supabase/client";

export type Book = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  subject: string;
  display_class: string;
  classes: string[];
  exams: string[];
  edition: string;
  book_type: string;
  cover_url: string;
  is_paid: boolean;
  price: number;
  description: string;
  no_of_chapters: number;
  content_mode: string;
  content_url: string | null;
  collection: string | null;
  display_order: number;
};

export const BOOK_FIELDS =
  "id,title,author,publisher,subject,display_class,classes,exams,edition,book_type,cover_url,is_paid,price,description,no_of_chapters,content_mode,content_url,collection,display_order";

export async function fetchBooks() {
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_FIELDS)
    .eq("status", "ACTIVE")
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Book[];
}

export async function fetchBook(id: string) {
  const { data, error } = await supabase
    .from("books")
    .select(BOOK_FIELDS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as Book | null;
}

export async function fetchChapters(bookId: string) {
  const { data, error } = await supabase
    .from("chapters")
    .select("id,ch_no,title,page_start,page_end,content_url,position")
    .eq("book_id", bookId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPasses() {
  const { data, error } = await supabase
    .from("passes")
    .select("*")
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchLibrary(userId: string) {
  const { data, error } = await supabase
    .from("library_items")
    .select(`book_id, added_at, books(${BOOK_FIELDS})`)
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as { book_id: string; added_at: string; books: Book }[];
}

export const booksQuery = { queryKey: ["books"], queryFn: fetchBooks, staleTime: 60_000 };
export const passesQuery = { queryKey: ["passes"], queryFn: fetchPasses, staleTime: 60_000 };

export function uniqueSorted(values: (string | null | undefined)[]) {
  return Array.from(new Set(values.filter((v): v is string => !!v && v.trim() !== ""))).sort();
}

export function inr(n: number) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

export type Chapter = {
  id: string;
  ch_no: string;
  title: string;
  page_start: number | null;
  page_end: number | null;
  content_url: string | null;
  position: number;
};

export type Pass = {
  id: string;
  title: string;
  subtitle: string;
  poster_url: string;
  description: string;
  exam: string;
  original_price: number;
  price: number;
  is_free: boolean;
  validity_months: number;
  status: string;
};

export const RESOURCE_KINDS = ["audio", "practice", "pyq", "video"] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export const RESOURCE_LABELS: Record<string, string> = {
  audio: "Audio book",
  practice: "Practice questions",
  pyq: "Previous year questions",
  video: "Video solution",
};

export async function fetchResources(bookId: string) {
  const { data, error } = await supabase
    .from("chapter_resources")
    .select("id,book_id,chapter_id,kind,title,url,created_at")
    .eq("book_id", bookId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllPasses() {
  const { data, error } = await supabase
    .from("passes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Pass[];
}

export async function fetchPassBooks(passId: string) {
  const { data, error } = await supabase
    .from("pass_books")
    .select(`book_id, books(${BOOK_FIELDS})`)
    .eq("pass_id", passId);
  if (error) throw error;
  return (data ?? []) as unknown as { book_id: string; books: Book }[];
}

export async function fetchMyPasses(userId: string) {
  const { data, error } = await supabase
    .from("user_passes")
    .select("id,pass_id,activated_at,expires_at,status,passes(*)")
    .eq("user_id", userId)
    .eq("status", "ACTIVE");
  if (error) throw error;
  return (data ?? []) as unknown as {
    id: string;
    pass_id: string;
    activated_at: string;
    expires_at: string | null;
    status: string;
    passes: Pass | null;
  }[];
}

export async function activatePass(passId: string) {
  const { error } = await supabase.rpc("activate_pass", { p_pass_id: passId });
  if (error) throw error;
}

export async function fetchNotes(bookId: string, chapterId?: string | null) {
  let q = supabase
    .from("notes")
    .select("id,chapter_id,kind,body,audio_url,color,created_at")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (chapterId) q = q.eq("chapter_id", chapterId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchHighlights(bookId: string, chapterId?: string | null) {
  let q = supabase
    .from("highlights")
    .select("id,chapter_id,quote,color,note,created_at")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
  if (chapterId) q = q.eq("chapter_id", chapterId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
