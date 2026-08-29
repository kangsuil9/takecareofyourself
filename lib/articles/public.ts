import "server-only";

import { cache } from "react";
import type { ArticleContentBlock, ArticleReference } from "@/lib/articles/cms.types";
import { createArticleImageSignedUrl } from "@/lib/articles/images";
import { parseArticleBlocks, parseArticleReferences } from "@/lib/articles/validation";
import { createClient } from "@/lib/supabase/server";

export type PublishedArticleSummary = {
  id: string;
  title: string;
  category: string;
  summary: string;
  readingTime: number | null;
  publishedAt: string;
  coverImageUrl: string | null;
};

export type PublishedArticleDetail = PublishedArticleSummary & {
  blocks: ArticleContentBlock[];
  references: ArticleReference[];
  imageUrls: Record<string, string>;
};

const summaryColumns = "id, title, category, summary, reading_time, published_at, cover_image_url" as const;

async function toSummary(
  article: {
    id: string;
    title: string;
    category: string;
    summary: string;
    reading_time: number | null;
    published_at: string | null;
    cover_image_url: string | null;
  },
  coverImageUrl: string | null,
): Promise<PublishedArticleSummary | null> {
  if (!article.published_at) return null;
  return {
    id: article.id,
    title: article.title,
    category: article.category,
    summary: article.summary,
    readingTime: article.reading_time,
    publishedAt: article.published_at,
    coverImageUrl,
  };
}

export async function getLatestPublishedArticle(): Promise<PublishedArticleSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(summaryColumns)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return toSummary(data, await createArticleImageSignedUrl(supabase, data.cover_image_url));
}

export async function getPublishedArticles(): Promise<PublishedArticleSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(summaryColumns)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  const summaries = await Promise.all(data.map(async (article) => toSummary(article, await createArticleImageSignedUrl(supabase, article.cover_image_url))));
  return summaries.filter((article): article is PublishedArticleSummary => article !== null);
}

export const getPublishedArticle = cache(async (articleId: string): Promise<PublishedArticleDetail | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, category, summary, reading_time, published_at, cover_image_url, content_blocks, reference_items")
    .eq("id", articleId)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  if (error || !data) return null;

  const parsedBlocks = parseArticleBlocks(JSON.stringify(data.content_blocks));
  const parsedReferences = parseArticleReferences(JSON.stringify(data.reference_items));
  if (!parsedBlocks.success || !parsedReferences.success) return null;

  const imagePaths = [...new Set(parsedBlocks.blocks.flatMap((block) => block.type === "image" && block.path ? [block.path] : []))];
  const [summary, imageEntries] = await Promise.all([
    toSummary(data, await createArticleImageSignedUrl(supabase, data.cover_image_url)),
    Promise.all(imagePaths.map(async (path) => [path, await createArticleImageSignedUrl(supabase, path)] as const)),
  ]);
  if (!summary) return null;

  return {
    ...summary,
    blocks: parsedBlocks.blocks,
    references: parsedReferences.references,
    imageUrls: Object.fromEntries(imageEntries.filter((entry): entry is [string, string] => Boolean(entry[1]))),
  };
});
