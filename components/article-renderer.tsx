import type { ArticleContentBlock, ArticleReference } from "@/lib/articles/cms.types";

function InlineText({ segments }: { segments: Extract<ArticleContentBlock, { segments: unknown }>['segments'] }) {
  return <>{segments.map((segment, index) => segment.bold ? <strong key={index}>{segment.text}</strong> : <span key={index}>{segment.text}</span>)}</>;
}

function safeExternalUrl(value: string) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}

export function ArticleRenderer({ blocks, references = [], imageUrls = {} }: { blocks: ArticleContentBlock[]; references?: ArticleReference[]; imageUrls?: Record<string, string> }) {
  return <div className="article-renderer">
    {blocks.map((block) => {
      if (block.type === "heading") return <h2 key={block.id}>{block.text}</h2>;
      if (block.type === "image") {
        const src = block.previewUrl ?? (block.path ? imageUrls[block.path] : undefined);
        return src ? <figure key={block.id}><img src={src} alt={block.alt || block.description || ""} />{block.alt ? <figcaption>{block.alt}</figcaption> : null}</figure> : <div className="article-image-placeholder" key={block.id}>{block.description || "이미지 미리보기"}</div>;
      }
      if (block.type === "key_message") return <p className="article-key-message" key={block.id}><InlineText segments={block.segments} /></p>;
      if (block.type === "callout") return <blockquote key={block.id}><InlineText segments={block.segments} /></blockquote>;
      return <p key={block.id}><InlineText segments={block.segments} /></p>;
    })}
    {references.length ? <section className="article-references" aria-labelledby="article-references-title"><h2 id="article-references-title">참고자료</h2><ol>{references.map((reference) => { const href = safeExternalUrl(reference.url); return <li key={reference.id}>{href ? <a href={href} target="_blank" rel="noreferrer">{reference.label}</a> : reference.label}</li>; })}</ol></section> : null}
  </div>;
}
