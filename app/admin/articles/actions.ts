"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ArticleStatus, Json } from "@/lib/supabase/database.types";
import type { ArticleContentBlock, ArticleFormState } from "@/lib/articles/cms.types";
import { parseArticleImage, removeArticleImages, uploadArticleImage } from "@/lib/articles/images";
import { articleBlocksHaveContent, parseArticleBlocks, parseArticleReferences } from "@/lib/articles/validation";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

type ExistingArticle = { cover_image_url: string | null; content_blocks: Json; status: ArticleStatus; published_at: string | null };

function getStoredImagePaths(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => item && typeof item === "object" && !Array.isArray(item) && typeof item.path === "string" ? [item.path] : []);
}

async function saveArticle(articleId: string | null, formData: FormData): Promise<ArticleFormState> {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const intent: ArticleStatus = formData.get("intent") === "publish" ? "PUBLISHED" : "DRAFT";
  const title = String(formData.get("title") ?? "").trim().slice(0, 300);
  const summary = String(formData.get("summary") ?? "").trim().slice(0, 1000);
  const category = String(formData.get("category") ?? "").trim().slice(0, 100);
  const readingTimeRaw = String(formData.get("readingTime") ?? "").trim();
  const readingTime = readingTimeRaw ? Number(readingTimeRaw) : null;
  if (readingTime !== null && (!Number.isInteger(readingTime) || readingTime < 1 || readingTime > 120)) return { error: "예상 읽기 시간은 1~120분 사이로 입력해주세요." };
  const parsedBlocks = parseArticleBlocks(String(formData.get("blocks") ?? "[]"));
  if (!parsedBlocks.success) return { error: parsedBlocks.error };
  const parsedReferences = parseArticleReferences(String(formData.get("references") ?? "[]"));
  if (!parsedReferences.success) return { error: parsedReferences.error };
  if (intent === "PUBLISHED" && (!title || !category || !articleBlocksHaveContent(parsedBlocks.blocks))) return { error: "발행하려면 제목, 카테고리, 본문을 입력해주세요." };

  let existing: ExistingArticle | null = null;
  if (articleId) {
    const result = await supabase.from("articles").select("cover_image_url, content_blocks, status, published_at").eq("id", articleId).maybeSingle();
    if (result.error || !result.data) return { error: "수정할 아티클을 찾지 못했어요." };
    existing = result.data;
  }
  const existingPaths = new Set(existing ? getStoredImagePaths(existing.content_blocks) : []);
  if (existing?.cover_image_url) existingPaths.add(existing.cover_image_url);
  for (const block of parsedBlocks.blocks) {
    if (block.type === "image" && block.path && !existingPaths.has(block.path)) return { error: "본문 이미지 경로를 확인해주세요." };
  }

  const uploadedPaths: string[] = [];
  const upload = async (entry: FormDataEntryValue | null) => {
    const parsed = parseArticleImage(entry);
    if (!parsed.success) return { path: null, error: parsed.error };
    if (!parsed.file || !parsed.extension) return { path: null, error: "업로드할 이미지를 다시 선택해주세요." };
    const result = await uploadArticleImage(supabase, profile.id, parsed.file, parsed.extension);
    if (result.error || !result.path) return { path: null, error: "이미지를 업로드하지 못했어요. Storage 설정을 확인해주세요." };
    uploadedPaths.push(result.path);
    return { path: result.path, error: null };
  };

  let coverPath = existing?.cover_image_url ?? null;
  const coverAction = String(formData.get("coverAction") ?? "keep");
  if (!['keep', 'remove', 'replace'].includes(coverAction)) return { error: "대표 이미지 변경 요청을 확인해주세요." };
  if (coverAction === "replace") {
    const result = await upload(formData.get("coverImage"));
    if (result.error) return { error: result.error };
    coverPath = result.path;
  } else if (coverAction === "remove") coverPath = null;

  const storedBlocks: ArticleContentBlock[] = [];
  for (const block of parsedBlocks.blocks) {
    if (block.type !== "image") { storedBlocks.push(block); continue; }
    if (block.path) { storedBlocks.push({ id: block.id, type: "image", path: block.path, alt: block.alt }); continue; }
    const result = await upload(formData.get(`block-image-${block.uploadKey}`));
    if (result.error || !result.path) {
      await removeArticleImages(supabase, uploadedPaths, profile.id);
      return { error: result.error ?? "본문 이미지를 업로드하지 못했어요." };
    }
    storedBlocks.push({ id: block.id, type: "image", path: result.path, alt: block.alt });
  }

  const publishedAt = intent === "PUBLISHED" ? (existing?.status === "PUBLISHED" ? existing.published_at : new Date().toISOString()) : null;
  const payload = { title, summary, category, reading_time: readingTime, cover_image_url: coverPath, content: "", content_blocks: storedBlocks as unknown as Json, references: parsedReferences.references as unknown as Json, status: intent, published_at: publishedAt };
  const result = articleId
    ? await supabase.from("articles").update(payload).eq("id", articleId).select("id").maybeSingle()
    : await supabase.from("articles").insert(payload).select("id").maybeSingle();
  if (result.error || !result.data) {
    await removeArticleImages(supabase, uploadedPaths, profile.id);
    return { error: "아티클을 저장하지 못했어요. migration과 권한 설정을 확인해주세요." };
  }

  const retainedPaths = new Set(storedBlocks.flatMap((block) => block.type === "image" && block.path ? [block.path] : []));
  if (coverPath) retainedPaths.add(coverPath);
  const removedPaths = [...existingPaths].filter((path) => !retainedPaths.has(path));
  await removeArticleImages(supabase, removedPaths, profile.id);
  revalidatePath("/admin/articles");
  redirect(`/admin/articles?saved=${intent === "PUBLISHED" ? "published" : "draft"}`);
}

export async function createArticle(_: ArticleFormState, formData: FormData) {
  return saveArticle(null, formData);
}

export async function updateArticle(_: ArticleFormState, formData: FormData) {
  const articleId = String(formData.get("articleId") ?? "");
  if (!articleId) return { error: "수정할 아티클을 찾지 못했어요." };
  return saveArticle(articleId, formData);
}
