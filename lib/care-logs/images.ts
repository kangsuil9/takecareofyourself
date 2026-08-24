import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { CARE_IMAGE_MAX_BYTES } from "@/lib/care-logs/images.shared";

export const CARE_IMAGE_BUCKET = "care-images";
const IMAGE_TYPES = { "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"], "image/webp": ["webp"] } as const;
type CareImageType = keyof typeof IMAGE_TYPES;
type StorageClient = SupabaseClient<Database>;

export function parseCareImage(formData: FormData):
  | { success: true; file: File | null; extension: string | null }
  | { success: false; error: string } {
  const entries = formData.getAll("image").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (entries.length > 1) return { success: false, error: "사진은 한 장만 선택할 수 있어요." };
  const file = entries[0] ?? null;
  if (!file) return { success: true, file: null, extension: null };
  if (file.size > CARE_IMAGE_MAX_BYTES) return { success: false, error: "사진은 5MB 이하로 선택해주세요." };
  if (!(file.type in IMAGE_TYPES)) return { success: false, error: "JPG, PNG, WEBP 사진만 사용할 수 있어요." };
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(IMAGE_TYPES[file.type as CareImageType] as readonly string[]).includes(extension)) return { success: false, error: "파일 형식과 확장자가 일치하는 사진을 선택해주세요." };
  return { success: true, file, extension: file.type === "image/jpeg" ? "jpg" : extension };
}

export function isOwnedCareImagePath(path: string, userId: string) {
  return path.startsWith(`${userId}/`) && path.split("/").length === 2;
}

export async function uploadCareImage(client: StorageClient, userId: string, file: File, extension: string) {
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await client.storage.from(CARE_IMAGE_BUCKET).upload(path, bytes, { contentType: file.type, upsert: false });
  return error ? { path: null, error } : { path, error: null };
}

export async function removeCareImage(client: StorageClient, path: string, userId: string) {
  if (!isOwnedCareImagePath(path, userId)) return false;
  const { error } = await client.storage.from(CARE_IMAGE_BUCKET).remove([path]);
  return !error;
}

export async function createCareImageSignedUrl(client: StorageClient, path: string | null) {
  if (!path) return null;
  const { data, error } = await client.storage.from(CARE_IMAGE_BUCKET).createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}
