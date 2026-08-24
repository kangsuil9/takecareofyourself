"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCareLogOwner } from "@/lib/care-logs/server";
import { parseCareLogFormData, type CareLogFormState } from "@/lib/care-logs/validation";
import { createClient } from "@/lib/supabase/server";

export async function createCareLog(_: CareLogFormState, formData: FormData): Promise<CareLogFormState> {
  const parsed = parseCareLogFormData(formData);
  if (!parsed.success) return { error: parsed.error };
  const profile = await requireCareLogOwner();
  const supabase = await createClient();
  const { error } = await supabase.from("care_logs").insert({ user_id: profile.id, category: parsed.data.category, content: parsed.data.content });
  if (error) return { error: "돌봄 기록을 저장하지 못했어요. 잠시 후 다시 시도해주세요." };
  revalidatePath("/care");
  redirect("/care?created=1");
}

export async function updateCareLog(_: CareLogFormState, formData: FormData): Promise<CareLogFormState> {
  const careLogId = String(formData.get("careLogId") ?? "");
  const parsed = parseCareLogFormData(formData);
  if (!careLogId || !parsed.success) return { error: parsed.success ? "수정할 기록을 찾지 못했어요." : parsed.error };
  const profile = await requireCareLogOwner();
  const supabase = await createClient();
  const { data, error } = await supabase.from("care_logs").update({ category: parsed.data.category, content: parsed.data.content }).eq("id", careLogId).eq("user_id", profile.id).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return { error: "이 돌봄 기록을 수정할 수 없어요." };
  revalidatePath("/care");
  redirect("/care?updated=1");
}

export async function softDeleteCareLog(formData: FormData) {
  const careLogId = String(formData.get("careLogId") ?? "");
  if (!careLogId) redirect("/care?error=delete");
  const profile = await requireCareLogOwner();
  const supabase = await createClient();
  const { data, error } = await supabase.from("care_logs").update({ deleted_at: new Date().toISOString() }).eq("id", careLogId).eq("user_id", profile.id).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) redirect("/care?error=delete");
  revalidatePath("/care");
  redirect("/care?deleted=1");
}
