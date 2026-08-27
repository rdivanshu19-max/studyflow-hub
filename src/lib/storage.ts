import { supabase } from "@/integrations/supabase/client";

export const BOOK_BUCKET = "book-content";
export const VOICE_BUCKET = "voice-notes";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
}

/** Uploads admin book content and returns the storage path. */
export async function uploadBookAsset(file: File, folder: string) {
  const path = `${folder}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(BOOK_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

export async function uploadVoiceNote(userId: string, blob: Blob) {
  const path = `${userId}/${Date.now()}.webm`;
  const { error } = await supabase.storage.from(VOICE_BUCKET).upload(path, blob, {
    contentType: blob.type || "audio/webm",
  });
  if (error) throw error;
  return path;
}

/** Storage paths are stored raw; resolve them to a temporary readable URL. */
export async function resolveUrl(value?: string | null, bucket: string = BOOK_BUCKET) {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(value, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
