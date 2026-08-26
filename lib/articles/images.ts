import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ARTICLE_IMAGE_MAX_BYTES } from "@/lib/articles/images.shared";

export const ARTICLE_IMAGE_BUCKET = "article-images";
const IMAGE_TYPES = { "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"], "image/webp": ["webp"] } as const;
type ImageMime = keyof typeof IMAGE_TYPES;
type StorageClient = SupabaseClient<Database>;

export function parseArticleImage(entry: FormDataEntryValue | null) {
  if (!(entry instanceof File) || entry.size === 0) return { success: true as const, file: null, extension: null };
  if (entry.size > ARTICLE_IMAGE_MAX_BYTES) return { success: false as const, error: "이미지는 5MB 이하로 선택해주세요." };
  if (!(entry.type in IMAGE_TYPES)) return { success: false as const, error: "JPG, PNG, WEBP 이미지만 사용할 수 있어요." };
  const extension = entry.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(IMAGE_TYPES[entry.type as ImageMime] as readonly string[]).includes(extension)) return { success: false as const, error: "파일 형식과 확장자가 일치하는 이미지를 선택해주세요." };
  return { success: true as const, file: entry, extension: entry.type === "image/jpeg" ? "jpg" : extension };
}

export function isOwnedArticleImagePath(path: string, profileId: string) {
  return path.startsWith(`${profileId}/`) && path.split("/").length === 2;
}

export async function uploadArticleImage(client: StorageClient, profileId: string, file: File, extension: string) {
  const path = `${profileId}/${crypto.randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await client.storage.from(ARTICLE_IMAGE_BUCKET).upload(path, bytes, { contentType: file.type, upsert: false });
  return error ? { path: null, error } : { path, error: null };
}

export async function removeArticleImages(client: StorageClient, paths: string[], profileId: string) {
  const owned = paths.filter((path) => isOwnedArticleImagePath(path, profileId));
  if (!owned.length) return true;
  const { error } = await client.storage.from(ARTICLE_IMAGE_BUCKET).remove(owned);
  return !error;
}

export async function createArticleImageSignedUrl(client: StorageClient, path: string | null) {
  if (!path) return null;
  const { data, error } = await client.storage.from(ARTICLE_IMAGE_BUCKET).createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}
