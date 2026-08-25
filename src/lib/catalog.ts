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
