import type { ArticleContentBlock } from "@/lib/articles/cms.types";

export function hasUnlinkedArticleImage(
  blocks: ArticleContentBlock[],
  hasPendingUpload: (block: Extract<ArticleContentBlock, { type: "image" }>) => boolean = () => false,
) {
  return blocks.some((block) => block.type === "image" && !block.path && !hasPendingUpload(block));
}
