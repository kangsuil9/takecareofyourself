export type ArticleInlineSegment = { text: string; bold?: true };

export type ArticleContentBlock =
  | { id: string; type: "paragraph"; segments: ArticleInlineSegment[] }
  | { id: string; type: "heading"; text: string }
  | { id: string; type: "key_message"; segments: ArticleInlineSegment[] }
  | { id: string; type: "callout"; segments: ArticleInlineSegment[] }
  | { id: string; type: "image"; path?: string; alt: string; uploadKey?: string; previewUrl?: string };

export type ArticleReference = { id: string; label: string; url: string };

export type ArticleFormState = { error: string | null };
