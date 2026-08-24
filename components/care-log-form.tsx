"use client";

import { useActionState, useState } from "react";
import { Info } from "lucide-react";
import type { CareLogFormState } from "@/lib/care-logs/validation";
import { CARE_CATEGORIES, CARE_LOG_CONTENT_MAX_LENGTH, type CareCategory } from "@/lib/care-logs/constants";

type CareLogAction = (state: CareLogFormState, formData: FormData) => Promise<CareLogFormState>;
type Props = { action: CareLogAction; careLogId?: string; initialCategory?: string | null; initialContent?: string; submitLabel: string };

export function CareLogForm({ action, careLogId, initialCategory = null, initialContent = "", submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [category, setCategory] = useState<CareCategory | null>(CARE_CATEGORIES.includes(initialCategory as CareCategory) ? (initialCategory as CareCategory) : null);
  const [content, setContent] = useState(initialContent);
  return (
    <form action={formAction} className="record-form">
      {careLogId ? <input type="hidden" name="careLogId" value={careLogId} /> : null}
      <input type="hidden" name="category" value={category ?? ""} />
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
      <div className="gentle-note"><Info size={17} aria-hidden="true" /><p>완벽한 하루보다, 나를 돌아본 마음이 더 중요해요.</p></div>
      {state.error ? <p className="form-error record-error" role="alert">{state.error}</p> : null}
      <button className="primary-button" type="submit" disabled={pending}>{pending ? "저장하는 중…" : submitLabel}</button>
    </form>
  );
}
