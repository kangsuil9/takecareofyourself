"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, Info, X } from "lucide-react";
import type { CareLogFormState } from "@/lib/care-logs/validation";
import { CARE_CATEGORIES, CARE_LOG_CONTENT_MAX_LENGTH, type CareCategory } from "@/lib/care-logs/constants";
import { CARE_IMAGE_ACCEPT, CARE_IMAGE_MAX_BYTES } from "@/lib/care-logs/images.shared";

type CareLogAction = (state: CareLogFormState, formData: FormData) => Promise<CareLogFormState>;
type Props = { action: CareLogAction; careLogId?: string; initialCategory?: string | null; initialContent?: string; initialImageUrl?: string | null; submitLabel: string };

export function CareLogForm({ action, careLogId, initialCategory = null, initialContent = "", initialImageUrl = null, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [category, setCategory] = useState<CareCategory | null>(CARE_CATEGORIES.includes(initialCategory as CareCategory) ? (initialCategory as CareCategory) : null);
  const [content, setContent] = useState(initialContent);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl);
  const [imageAction, setImageAction] = useState<"keep" | "remove" | "replace">("keep");
  const [imageError, setImageError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function chooseImage(file: File | undefined) {
    setImageError(null);
    if (!file) return;
    if (!CARE_IMAGE_ACCEPT.split(",").includes(file.type)) {
      if (inputRef.current) inputRef.current.value = "";
      setImageError("JPG, PNG, WEBP 사진만 사용할 수 있어요.");
      return;
    }
    if (file.size > CARE_IMAGE_MAX_BYTES) {
      if (inputRef.current) inputRef.current.value = "";
      setImageError("사진은 5MB 이하로 선택해주세요.");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setImageAction("replace");
  }

  function removeImage() {
    if (inputRef.current) inputRef.current.value = "";
    setPreviewUrl(null);
    setImageError(null);
    setImageAction(initialImageUrl ? "remove" : "keep");
  }
  return (
    <form action={formAction} className="record-form">
      {careLogId ? <input type="hidden" name="careLogId" value={careLogId} /> : null}
      <input type="hidden" name="category" value={category ?? ""} />
      <input type="hidden" name="imageAction" value={imageAction} />
      <fieldset disabled={pending}>
        <legend>어떤 돌봄이었나요? <span>선택</span></legend>
        <p className="field-help">정하지 않아도 기록할 수 있어요.</p>
        <div className="topic-grid">
          {CARE_CATEGORIES.map((topic) => <button type="button" key={topic} className={category === topic ? "topic-button selected" : "topic-button"} aria-pressed={category === topic} onClick={() => setCategory(category === topic ? null : topic)}>{topic}</button>)}
        </div>
      </fieldset>
      <label className="field-label" htmlFor="care-content">오늘의 돌봄 이야기</label>
      <div className="textarea-wrap">
        <textarea id="care-content" name="content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="오늘 나를 위해 무엇을 했나요?" maxLength={CARE_LOG_CONTENT_MAX_LENGTH} required disabled={pending} />
        <span>{content.length} / {CARE_LOG_CONTENT_MAX_LENGTH}</span>
      </div>
      <div className="photo-field">
        <span className="field-label">사진 <small>선택 · 최대 1장 · 5MB</small></span>
        <input ref={inputRef} className="photo-input" id="care-image" name="image" type="file" accept={CARE_IMAGE_ACCEPT} onChange={(event) => chooseImage(event.target.files?.[0])} disabled={pending} />
        {previewUrl ? <div className="photo-preview"><img src={previewUrl} alt="선택한 돌봄 사진 미리보기" /><button type="button" onClick={removeImage} disabled={pending}><X size={17} aria-hidden="true" /> 사진 제거</button></div> : <label className="photo-button" htmlFor="care-image"><Camera size={23} aria-hidden="true" /><span>사진 한 장 선택하기</span></label>}
        {imageError ? <p className="form-error photo-error" role="alert">{imageError}</p> : null}
      </div>
      <div className="gentle-note"><Info size={17} aria-hidden="true" /><p>완벽한 하루보다, 나를 돌아본 마음이 더 중요해요.</p></div>
      {state.error ? <p className="form-error record-error" role="alert">{state.error}</p> : null}
      <button className="primary-button" type="submit" disabled={pending}>{pending ? "저장하는 중…" : submitLabel}</button>
    </form>
  );
}
