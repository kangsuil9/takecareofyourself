import type { ArticleContentBlock, ArticleInlineSegment } from "@/lib/articles/cms.types";

export type ArticleDraftImportResult =
  | { success: true; blocks: ArticleContentBlock[] }
  | { success: false; error: string };

export function parseInlineBold(text: string): ArticleInlineSegment[] {
  const segments: ArticleInlineSegment[] = [];
  const pattern = /\*\*([^*\n]+?)\*\*/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) segments.push({ text: text.slice(cursor, index) });
    segments.push({ text: match[1], bold: true });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments.length ? segments : [{ text }];
}

export function parseArticleDraft(source: string, createId: () => string, maxImages: number): ArticleDraftImportResult {
  if (!source.trim()) return { success: false, error: "변환할 원고를 입력해주세요." };
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ArticleContentBlock[] = [];
  let paragraphLines: string[] = [];
  let imageCount = 0;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push({ id: createId(), type: "paragraph", segments: parseInlineBold(paragraphLines.join("\n")) });
    paragraphLines = [];
  };

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) { flushParagraph(); index += 1; continue; }

    const keyMessage = line.match(/^###\s+(.*)$/);
    if (keyMessage) {
      flushParagraph();
      const content = [keyMessage[1]];
      index += 1;
      while (index < lines.length) {
        const next = lines[index].match(/^###\s+(.*)$/);
        if (!next) break;
        content.push(next[1]);
        index += 1;
      }
      blocks.push({ id: createId(), type: "key_message", segments: parseInlineBold(content.join("\n")) });
      continue;
    }

    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      flushParagraph();
      blocks.push({ id: createId(), type: "heading", text: heading[1].trim() });
      index += 1;
      continue;
    }

    const callout = line.match(/^>\s?(.*)$/);
    if (callout) {
      flushParagraph();
      const content = [callout[1]];
      index += 1;
      while (index < lines.length) {
        const next = lines[index].match(/^>\s?(.*)$/);
        if (!next) break;
        content.push(next[1]);
        index += 1;
      }
      blocks.push({ id: createId(), type: "callout", segments: parseInlineBold(content.join("\n")) });
      continue;
    }

    const image = line.match(/^\[이미지:\s*(.*?)\]\s*$/);
    if (image) {
      flushParagraph();
      imageCount += 1;
      if (imageCount > maxImages) return { success: false, error: `본문 이미지는 최대 ${maxImages}장까지 사용할 수 있어요. 표시자를 줄인 뒤 다시 변환해주세요.` };
      blocks.push({ id: createId(), type: "image", alt: "", description: image[1].trim(), uploadKey: createId() });
      index += 1;
      continue;
    }

    paragraphLines.push(line);
    index += 1;
  }

  flushParagraph();
  return { success: true, blocks };
}
