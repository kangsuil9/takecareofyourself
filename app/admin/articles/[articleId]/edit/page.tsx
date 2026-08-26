import { notFound } from "next/navigation";
import type { Json } from "@/lib/supabase/database.types";
import type { ArticleContentBlock, ArticleReference } from "@/lib/articles/cms.types";
import { updateArticle } from "@/app/admin/articles/actions";
import { ArticleEditor } from "@/components/article-editor";
import { createArticleImageSignedUrl } from "@/lib/articles/images";
import { parseArticleBlocks, parseArticleReferences } from "@/lib/articles/validation";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ articleId: string }> };
const asBlocks = (value: Json): ArticleContentBlock[] => {
  const result = parseArticleBlocks(JSON.stringify(value));
  return result.success ? result.blocks : [];
};
const asReferences = (value: Json): ArticleReference[] => {
  const result = parseArticleReferences(JSON.stringify(value));
  return result.success ? result.references : [];
};

export default async function EditArticlePage({ params }: Props) {
  const { articleId } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase.from("articles").select("id, title, summary, category, reading_time, cover_image_url, content_blocks, reference_items, status").eq("id", articleId).maybeSingle();
  if (!article) notFound();
  const blocks = asBlocks(article.content_blocks);
  const paths = [...new Set(blocks.flatMap((block) => block.type === "image" && block.path ? [block.path] : []))];
  const imageUrls = Object.fromEntries((await Promise.all(paths.map(async (path) => [path, await createArticleImageSignedUrl(supabase, path)] as const))).filter((entry): entry is [string, string] => Boolean(entry[1])));
  const coverImageUrl = await createArticleImageSignedUrl(supabase, article.cover_image_url);
  return <div className="admin-page"><ArticleEditor action={updateArticle} heading="건강지식 아티클 수정" articleId={article.id} initial={{ title: article.title, summary: article.summary, category: article.category, readingTime: article.reading_time, coverPath: article.cover_image_url, coverImageUrl, blocks, references: asReferences(article.reference_items), status: article.status }} imageUrls={imageUrls} /></div>;
}
