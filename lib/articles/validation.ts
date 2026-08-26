import type { ArticleContentBlock, ArticleInlineSegment, ArticleReference } from "./cms.types.ts";
import { ARTICLE_IMAGE_MAX_COUNT } from "./images.shared.ts";

const BLOCK_TYPES = new Set(["paragraph", "heading", "key_message", "callout", "image"]);
const MAX_BLOCKS = 80;
const MAX_TEXT = 5000;

function parseSegments(value: unknown): ArticleInlineSegment[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) return null;
  const segments: ArticleInlineSegment[] = [];
  for (const segment of value) {
    if (!segment || typeof segment !== "object") return null;
    const item = segment as Record<string, unknown>;
    if (typeof item.text !== "string" || item.text.length > MAX_TEXT || (item.bold !== undefined && item.bold !== true)) return null;
    segments.push(item.bold === true ? { text: item.text, bold: true } : { text: item.text });
  }
  return segments;
}

export function parseArticleBlocks(raw: string): { success: true; blocks: ArticleContentBlock[] } | { success: false; error: string } {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { success: false, error: "본문 구성을 확인해주세요." }; }
  if (!Array.isArray(value) || value.length > MAX_BLOCKS) return { success: false, error: "본문 블록은 최대 80개까지 사용할 수 있어요." };
  let imageCount = 0;
  const blocks: ArticleContentBlock[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") return { success: false, error: "본문 블록 형식이 올바르지 않아요." };
    const block = candidate as Record<string, unknown>;
    if (typeof block.id !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(block.id) || typeof block.type !== "string" || !BLOCK_TYPES.has(block.type)) return { success: false, error: "허용되지 않은 본문 블록이 있어요." };
    if (block.type === "heading") {
      if (typeof block.text !== "string" || block.text.length > 300) return { success: false, error: "소제목을 확인해주세요." };
      blocks.push({ id: block.id, type: "heading", text: block.text.trim() });
      continue;
    }
    if (block.type === "image") {
      imageCount += 1;
      if (imageCount > ARTICLE_IMAGE_MAX_COUNT) return { success: false, error: `본문 이미지는 최대 ${ARTICLE_IMAGE_MAX_COUNT}장까지 사용할 수 있어요.` };
      const path = typeof block.path === "string" && block.path ? block.path : undefined;
      const uploadKey = typeof block.uploadKey === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(block.uploadKey) ? block.uploadKey : undefined;
      const alt = typeof block.alt === "string" ? block.alt.trim().slice(0, 300) : "";
      const description = typeof block.description === "string" ? block.description.trim().slice(0, 300) : "";
      if (path && uploadKey) return { success: false, error: "본문 이미지를 다시 선택해주세요." };
      blocks.push({ id: block.id, type: "image", path, uploadKey, alt, description });
      continue;
    }
    const segments = parseSegments(block.segments);
    if (!segments) return { success: false, error: "본문 텍스트 형식을 확인해주세요." };
    blocks.push({ id: block.id, type: block.type as "paragraph" | "key_message" | "callout", segments });
  }
  return { success: true, blocks };
}

export function parseArticleReferences(raw: string): { success: true; references: ArticleReference[] } | { success: false; error: string } {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { success: false, error: "참고자료 구성을 확인해주세요." }; }
  if (!Array.isArray(value) || value.length > 30) return { success: false, error: "참고자료는 최대 30개까지 추가할 수 있어요." };
  const references: ArticleReference[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") return { success: false, error: "참고자료 형식이 올바르지 않아요." };
    const item = candidate as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id : "";
    const label = typeof item.label === "string" ? item.label.trim() : "";
    const url = typeof item.url === "string" ? item.url.trim() : "";
    if (!label && !url) continue;
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(id) || !label || label.length > 500) return { success: false, error: "참고자료의 표시 이름을 입력해주세요." };
    if (url) {
      try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      } catch { return { success: false, error: "참고자료 URL은 http 또는 https 주소만 사용할 수 있어요." }; }
    }
    references.push({ id, label, url });
  }
  return { success: true, references };
}

export function articleBlocksHaveContent(blocks: ArticleContentBlock[]) {
  return blocks.some((block) => block.type !== "image" && (block.type === "heading" ? block.text.trim() : block.segments.some((segment) => segment.text.trim())));
}
