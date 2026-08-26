"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Bold, Camera, ClipboardPaste, Eye, FileText, Heading2, ImagePlus, MessageSquareQuote, Plus, Trash2, X } from "lucide-react";
import { ArticleRenderer } from "@/components/article-renderer";
import type { ArticleContentBlock, ArticleFormState, ArticleReference } from "@/lib/articles/cms.types";
import { ARTICLE_IMAGE_ACCEPT, ARTICLE_IMAGE_MAX_BYTES, ARTICLE_IMAGE_MAX_COUNT } from "@/lib/articles/images.shared";
import { parseArticleDraft } from "@/lib/articles/import-draft";
import type { ArticleStatus } from "@/lib/supabase/database.types";

type ArticleAction = (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
type InitialArticle = { title: string; summary: string; category: string; readingTime: number | null; coverPath: string | null; coverImageUrl: string | null; blocks: ArticleContentBlock[]; references: ArticleReference[]; status: ArticleStatus };
type Props = { action: ArticleAction; heading: string; articleId?: string; initial?: InitialArticle; imageUrls?: Record<string, string> };
type TextBlock = Extract<ArticleContentBlock, { segments: unknown }>;

const DEFAULT_BLOCK: ArticleContentBlock = { id: "initial-paragraph", type: "paragraph", segments: [{ text: "" }] };
const createId = () => crypto.randomUUID();
const blockLabel = { paragraph: "본문", heading: "소제목", key_message: "핵심 문장", callout: "강조 블록", image: "이미지" } as const;

function textOf(block: TextBlock) { return block.segments.map((segment) => segment.text).join(""); }

function boldMarksOf(block: TextBlock) {
  return block.segments.flatMap((segment) => Array(segment.text.length).fill(segment.bold === true) as boolean[]);
}

function segmentsFromTextAndMarks(text: string, marks: boolean[]) {
  if (!text) return [{ text: "" }];
  const segments: TextBlock['segments'] = [];
  let start = 0;
  for (let index = 1; index <= text.length; index += 1) {
    if (index === text.length || marks[index] !== marks[start]) {
      const segmentText = text.slice(start, index);
      segments.push(marks[start] ? { text: segmentText, bold: true } : { text: segmentText });
      start = index;
    }
  }
  return segments;
}

export function ArticleEditor({ action, heading, articleId, initial, imageUrls = {} }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [readingTime, setReadingTime] = useState(initial?.readingTime?.toString() ?? "");
  const [blocks, setBlocks] = useState<ArticleContentBlock[]>(initial?.blocks.length ? initial.blocks : [DEFAULT_BLOCK]);
  const [references, setReferences] = useState<ArticleReference[]>(initial?.references ?? []);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(initial?.coverImageUrl ?? null);
  const [coverAction, setCoverAction] = useState<"keep" | "remove" | "replace">("keep");
  const [imageError, setImageError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importSource, setImportSource] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<ArticleContentBlock[] | null>(null);
  const textareas = useRef(new Map<string, HTMLTextAreaElement>());

  function validateImage(file: File) {
    if (!ARTICLE_IMAGE_ACCEPT.split(",").includes(file.type)) return "JPG, PNG, WEBP 이미지만 사용할 수 있어요.";
    if (file.size > ARTICLE_IMAGE_MAX_BYTES) return "이미지는 5MB 이하로 선택해주세요.";
    return null;
  }

  function addBlock(type: ArticleContentBlock['type']) {
    if (type === "image") {
      if (blocks.filter((block) => block.type === "image").length >= ARTICLE_IMAGE_MAX_COUNT) { setImageError(`본문 이미지는 최대 ${ARTICLE_IMAGE_MAX_COUNT}장까지 사용할 수 있어요.`); return; }
      setBlocks((current) => [...current, { id: createId(), type: "image", uploadKey: createId(), alt: "", description: "" }]);
    } else if (type === "heading") setBlocks((current) => [...current, { id: createId(), type, text: "" }]);
    else setBlocks((current) => [...current, { id: createId(), type, segments: [{ text: "" }] }]);
  }

  function updateBlock(id: string, update: (block: ArticleContentBlock) => ArticleContentBlock) {
    setBlocks((current) => current.map((block) => block.id === id ? update(block) : block));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((current) => { const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
  }

  function removeBlock(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id));
  }

  function setText(block: TextBlock, text: string) {
    const previousText = textOf(block);
    const previousMarks = boldMarksOf(block);
    let prefix = 0;
    while (prefix < previousText.length && prefix < text.length && previousText[prefix] === text[prefix]) prefix += 1;
    let suffix = 0;
    while (suffix < previousText.length - prefix && suffix < text.length - prefix && previousText[previousText.length - 1 - suffix] === text[text.length - 1 - suffix]) suffix += 1;
    const nextMarks = [
      ...previousMarks.slice(0, prefix),
      ...Array(Math.max(0, text.length - prefix - suffix)).fill(false),
      ...previousMarks.slice(previousText.length - suffix),
    ];
    updateBlock(block.id, () => ({ ...block, segments: segmentsFromTextAndMarks(text, nextMarks) }));
  }

  function applyBold(block: TextBlock) {
    const textarea = textareas.current.get(block.id);
    if (!textarea || textarea.selectionStart === textarea.selectionEnd) { setImageError("굵게 표시할 짧은 구절을 먼저 선택해주세요."); return; }
    const text = textOf(block);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const marks = boldMarksOf(block);
    for (let index = start; index < end; index += 1) marks[index] = true;
    const segments = segmentsFromTextAndMarks(text, marks);
    updateBlock(block.id, () => ({ ...block, segments }));
    setImageError(null);
  }

  function chooseBlockImage(block: Extract<ArticleContentBlock, { type: "image" }>, file: File | undefined, input: HTMLInputElement) {
    if (!file) return;
    const error = validateImage(file);
    if (error) { input.value = ""; setImageError(error); return; }
    setImageError(null);
    updateBlock(block.id, () => ({ ...block, path: undefined, uploadKey: block.uploadKey ?? block.id, previewUrl: URL.createObjectURL(file) }));
  }

  function chooseCover(file: File | undefined, input: HTMLInputElement) {
    if (!file) return;
    const error = validateImage(file);
    if (error) { input.value = ""; setImageError(error); return; }
    setImageError(null);
    setCoverPreview(URL.createObjectURL(file));
    setCoverAction("replace");
  }

  function convertImportedDraft() {
    const result = parseArticleDraft(importSource, createId, ARTICLE_IMAGE_MAX_COUNT);
    if (!result.success) { setImportError(result.error); return; }
    setImportError(null);
    if (blocks.length) { setPendingImport(result.blocks); return; }
    setBlocks(result.blocks);
    setImportOpen(false);
    setImportSource("");
  }

  function confirmImportedDraft() {
    if (!pendingImport) return;
    setBlocks(pendingImport);
    setPendingImport(null);
    setImportOpen(false);
    setImportSource("");
    setImageError(null);
  }

  const serializedBlocks = blocks.map((block) => block.type === "image" ? { id: block.id, type: block.type, path: block.path, uploadKey: block.uploadKey, alt: block.alt, description: block.description } : block);
  const previewImageUrls = { ...imageUrls, ...Object.fromEntries(blocks.flatMap((block) => block.type === "image" && block.path && block.previewUrl ? [[block.path, block.previewUrl]] : [])) };

  return <>
    <header className="admin-editor-heading"><div><Link href="/admin/articles">← 목록</Link><h1>{heading}</h1><p>{initial ? `현재 상태: ${initial.status}` : "새 글은 초안으로 시작합니다."}</p></div><button type="button" className="admin-preview-button" onClick={() => setPreviewOpen(true)}><Eye size={17} /> 미리보기</button></header>
    <form action={formAction} className="article-editor-form">
      {articleId ? <input type="hidden" name="articleId" value={articleId} /> : null}
      <input type="hidden" name="blocks" value={JSON.stringify(serializedBlocks)} />
      <input type="hidden" name="references" value={JSON.stringify(references)} />
      <input type="hidden" name="coverAction" value={coverAction} />
      <fieldset disabled={pending}>
        <section className="admin-form-card"><h2>기본 정보</h2><div className="admin-field-grid">
          <label><span>제목</span><input name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={300} placeholder="아티클 제목" /></label>
          <label><span>한 줄 소개</span><textarea name="summary" value={summary} onChange={(event) => setSummary(event.target.value)} maxLength={1000} placeholder="독자가 글의 맥락을 이해할 수 있는 짧은 소개" /></label>
          <div className="admin-split-fields"><label><span>카테고리</span><input name="category" value={category} onChange={(event) => setCategory(event.target.value)} maxLength={100} placeholder="예: 수면" list="article-categories" /><datalist id="article-categories"><option value="수면" /><option value="영양" /><option value="혈당" /><option value="운동" /><option value="스트레스" /><option value="휴식" /></datalist></label><label><span>예상 읽기 시간</span><div className="reading-time-input"><input name="readingTime" type="number" min="1" max="120" value={readingTime} onChange={(event) => setReadingTime(event.target.value)} /><em>분</em></div></label></div>
        </div></section>

        <section className="admin-form-card"><h2>대표 이미지 <small>선택 · 5MB</small></h2><input className="admin-file-input" id="cover-image" name="coverImage" type="file" accept={ARTICLE_IMAGE_ACCEPT} onChange={(event) => chooseCover(event.target.files?.[0], event.currentTarget)} />{coverPreview ? <div className="admin-cover-preview"><img src={coverPreview} alt="대표 이미지 미리보기" /><button type="button" onClick={() => { setCoverPreview(null); setCoverAction(initial?.coverPath ? "remove" : "keep"); }}><X size={16} /> 제거</button></div> : <label className="admin-image-picker" htmlFor="cover-image"><Camera size={20} /> 대표 이미지 선택</label>}</section>

        <section className="admin-form-card"><div className="admin-card-heading"><div><h2>본문</h2><p>내용의 의미만 선택하면 돌봄 디자인이 자동으로 적용됩니다.</p></div><button type="button" className="admin-small-button" onClick={() => setImportOpen((open) => !open)}><ClipboardPaste size={15} /> 원고 한 번에 입력</button></div>{importOpen ? <div className="draft-import-panel"><div className="draft-import-guide"><strong>원고를 붙여넣어 주세요.</strong><span>일반 문장 → 본문</span><span>**텍스트** → 굵게</span><span>## → 소제목 · ### → 핵심 문장</span><span>&gt; → 강조 블록</span><span>[이미지: 설명] → 이미지 자리</span></div><textarea value={importSource} onChange={(event) => { setImportSource(event.target.value); setImportError(null); }} placeholder="긴 원고 전체를 여기에 붙여넣어 주세요." /><button type="button" className="draft-convert-button" onClick={convertImportedDraft}>블록으로 변환</button>{importError ? <p className="admin-form-error" role="alert">{importError}</p> : null}</div> : null}<div className="block-add-toolbar"><button type="button" onClick={() => addBlock("paragraph")}><FileText size={15} /> 본문</button><button type="button" onClick={() => addBlock("heading")}><Heading2 size={15} /> 소제목</button><button type="button" onClick={() => addBlock("key_message")}><MessageSquareQuote size={15} /> 핵심 문장</button><button type="button" onClick={() => addBlock("callout")}><MessageSquareQuote size={15} /> 강조 블록</button><button type="button" onClick={() => addBlock("image")}><ImagePlus size={15} /> 이미지</button></div>
          <div className="article-block-list">{blocks.map((block, index) => <div className={`article-editor-block ${block.type}`} key={block.id}><header><strong>{blockLabel[block.type]}</strong><div><button type="button" aria-label="위로 이동" onClick={() => moveBlock(index, -1)} disabled={index === 0}><ArrowUp size={15} /></button><button type="button" aria-label="아래로 이동" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1}><ArrowDown size={15} /></button><button type="button" aria-label="블록 삭제" onClick={() => removeBlock(block.id)}><Trash2 size={15} /></button></div></header>
            {block.type === "heading" ? <input value={block.text} onChange={(event) => updateBlock(block.id, () => ({ ...block, text: event.target.value }))} placeholder="소제목을 입력하세요" maxLength={300} /> : block.type === "image" ? <div className="article-block-image"><p className="article-image-description"><span>관리용 이미지 설명</span>{block.description || "설명 없음"}</p><input className="admin-file-input" id={`block-image-${block.id}`} name={`block-image-${block.uploadKey ?? block.id}`} type="file" accept={ARTICLE_IMAGE_ACCEPT} onChange={(event) => chooseBlockImage(block, event.target.files?.[0], event.currentTarget)} />{block.previewUrl || (block.path && imageUrls[block.path]) ? <><img src={block.previewUrl ?? imageUrls[block.path!]} alt="본문 이미지 미리보기" /><label className="admin-replace-image" htmlFor={`block-image-${block.id}`}>이미지 교체</label></> : <label className="admin-image-picker" htmlFor={`block-image-${block.id}`}><ImagePlus size={18} /> 이미지 파일 선택</label>}<input value={block.description ?? ""} onChange={(event) => updateBlock(block.id, () => ({ ...block, description: event.target.value }))} placeholder="관리용 이미지 설명 (사용자 화면 caption 아님)" maxLength={300} /></div> : <div className="article-text-control"><div className="inline-toolbar"><button type="button" onClick={() => applyBold(block)}><Bold size={14} /> 선택 영역 굵게</button>{block.segments.some((segment) => segment.bold) ? <span>굵은 구절 적용됨</span> : null}</div><textarea ref={(element) => { if (element) textareas.current.set(block.id, element); else textareas.current.delete(block.id); }} value={textOf(block)} onChange={(event) => setText(block, event.target.value)} placeholder={`${blockLabel[block.type]} 내용을 입력하세요`} /></div>}
          </div>)}</div>
        </section>

        <section className="admin-form-card"><div className="admin-card-heading"><div><h2>참고자료</h2><p>URL은 선택이며 http 또는 https 주소만 저장됩니다.</p></div><button type="button" className="admin-small-button" onClick={() => setReferences((current) => [...current, { id: createId(), label: "", url: "" }])}><Plus size={15} /> 추가</button></div><div className="reference-list">{references.map((reference) => <div className="reference-row" key={reference.id}><input value={reference.label} onChange={(event) => setReferences((current) => current.map((item) => item.id === reference.id ? { ...item, label: event.target.value } : item))} placeholder="표시 이름" /><input value={reference.url} onChange={(event) => setReferences((current) => current.map((item) => item.id === reference.id ? { ...item, url: event.target.value } : item))} placeholder="https://… (선택)" inputMode="url" /><button type="button" aria-label="참고자료 삭제" onClick={() => setReferences((current) => current.filter((item) => item.id !== reference.id))}><Trash2 size={16} /></button></div>)}{!references.length ? <p className="admin-muted">추가된 참고자료가 없습니다.</p> : null}</div></section>
      </fieldset>
      {imageError ? <p className="admin-form-error" role="alert">{imageError}</p> : null}
      {state.error ? <p className="admin-form-error" role="alert">{state.error}</p> : null}
      <div className="admin-savebar"><button type="submit" name="intent" value="draft" disabled={pending}>{pending ? "저장 중…" : "초안 저장"}</button><button className="publish" type="submit" name="intent" value="publish" disabled={pending}>{pending ? "저장 중…" : "발행"}</button></div>
    </form>
    {previewOpen ? <div className="article-preview-overlay" role="dialog" aria-modal="true" aria-label="아티클 미리보기"><div className="article-preview-panel"><header><div><span>모바일 미리보기</span><strong>{title || "제목 없는 아티클"}</strong></div><button type="button" onClick={() => setPreviewOpen(false)} aria-label="미리보기 닫기"><X size={20} /></button></header><article className="cms-article-preview"><div className="cms-preview-heading"><span className="category-chip">{category || "카테고리"}</span><h1>{title || "아티클 제목"}</h1><p>{summary || "한 줄 소개가 여기에 표시됩니다."}</p>{readingTime ? <small>읽는 데 약 {readingTime}분</small> : null}</div>{coverPreview ? <img className="cms-preview-cover" src={coverPreview} alt="대표 이미지" /> : null}<ArticleRenderer blocks={blocks} references={references.filter((reference) => reference.label.trim())} imageUrls={previewImageUrls} /></article></div></div> : null}
    {pendingImport ? <div className="article-preview-overlay" role="dialog" aria-modal="true" aria-labelledby="replace-draft-title"><div className="replace-draft-dialog"><h2 id="replace-draft-title">현재 작성 중인 본문을 새 원고로 교체할까요?</h2><p>기존 본문 블록은 사라집니다.</p><div><button type="button" onClick={() => setPendingImport(null)}>취소</button><button type="button" className="replace" onClick={confirmImportedDraft}>교체하고 변환</button></div></div></div> : null}
  </>;
}
