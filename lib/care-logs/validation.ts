import { CARE_CATEGORIES, CARE_LOG_CONTENT_MAX_LENGTH, type CareCategory } from "@/lib/care-logs/constants";

export type CareLogInput = { category: CareCategory | null; content: string };
export type CareLogFormState = { error: string | null };

export function parseCareLogFormData(formData: FormData):
  | { success: true; data: CareLogInput }
  | { success: false; error: string } {
  const content = String(formData.get("content") ?? "").trim();
  const rawCategory = String(formData.get("category") ?? "").trim();
  if (!content) return { success: false, error: "오늘의 돌봄 이야기를 입력해주세요." };
  if (content.length > CARE_LOG_CONTENT_MAX_LENGTH) return { success: false, error: `돌봄 이야기는 ${CARE_LOG_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.` };
  if (rawCategory && !CARE_CATEGORIES.includes(rawCategory as CareCategory)) return { success: false, error: "올바른 돌봄 주제를 선택해주세요." };
  return { success: true, data: { category: rawCategory ? (rawCategory as CareCategory) : null, content } };
}
