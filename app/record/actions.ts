"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCareLogOwner } from "@/lib/care-logs/server";
import { parseCareImage, removeCareImage, uploadCareImage } from "@/lib/care-logs/images";
import { parseCareLogFormData, type CareLogFormState } from "@/lib/care-logs/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function createCareLog(_: CareLogFormState, formData: FormData): Promise<CareLogFormState> {
  const parsed = parseCareLogFormData(formData);
  if (!parsed.success) return { error: parsed.error };
  const image = parseCareImage(formData);
  if (!image.success) return { error: image.error };
  const profile = await requireCareLogOwner();
  const supabase = await createClient();
  let imagePath: string | null = null;
  if (image.file && image.extension) {
    const upload = await uploadCareImage(supabase, profile.id, image.file, image.extension);
    if (upload.error || !upload.path) return { error: "사진을 업로드하지 못했어요. 잠시 후 다시 시도해주세요." };
    imagePath = upload.path;
  }
  const { error } = await supabase.from("care_logs").insert({ user_id: profile.id, category: parsed.data.category, content: parsed.data.content, image_url: imagePath });
  if (error) {
    if (imagePath) await removeCareImage(supabase, imagePath, profile.id);
    return { error: "돌봄 기록을 저장하지 못했어요. 잠시 후 다시 시도해주세요." };
  }
  revalidatePath("/care");
  redirect("/care?created=1");
}

export async function updateCareLog(_: CareLogFormState, formData: FormData): Promise<CareLogFormState> {
  const careLogId = String(formData.get("careLogId") ?? "");
  const parsed = parseCareLogFormData(formData);
  if (!careLogId || !parsed.success) return { error: parsed.success ? "수정할 기록을 찾지 못했어요." : parsed.error };
  const image = parseCareImage(formData);
  if (!image.success) return { error: image.error };
  const profile = await requireCareLogOwner();
  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase.from("care_logs").select("id, image_url").eq("id", careLogId).eq("user_id", profile.id).is("deleted_at", null).maybeSingle();
  if (readError || !existing) return { error: "이 돌봄 기록을 수정할 수 없어요." };
  const imageAction = String(formData.get("imageAction") ?? "keep");
  if (!["keep", "remove", "replace"].includes(imageAction)) return { error: "사진 변경 요청을 확인해주세요." };

  let nextImagePath = existing.image_url;
  let uploadedPath: string | null = null;
  if (image.file && image.extension) {
    const upload = await uploadCareImage(supabase, profile.id, image.file, image.extension);
    if (upload.error || !upload.path) return { error: "새 사진을 업로드하지 못했어요. 잠시 후 다시 시도해주세요." };
    uploadedPath = upload.path;
    nextImagePath = uploadedPath;
  } else if (imageAction === "remove") {
    nextImagePath = null;
  } else if (imageAction === "replace") {
    return { error: "교체할 사진을 다시 선택해주세요." };
  }

  const { data, error } = await supabase.from("care_logs").update({ category: parsed.data.category, content: parsed.data.content, image_url: nextImagePath }).eq("id", careLogId).eq("user_id", profile.id).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) {
    if (uploadedPath) await removeCareImage(supabase, uploadedPath, profile.id);
    return { error: "이 돌봄 기록을 수정할 수 없어요." };
  }
  if (existing.image_url && existing.image_url !== nextImagePath) await removeCareImage(supabase, existing.image_url, profile.id);
  revalidatePath("/care");
  redirect("/care?updated=1");
}

export async function softDeleteCareLog(formData: FormData) {
  const careLogId = String(formData.get("careLogId") ?? "");
  if (!careLogId) redirect("/care?error=delete");
  const profile = await requireCareLogOwner();
  const supabase = await createClient();
  const { data: ownedCareLog, error: readError } = await supabase.from("care_logs").select("id").eq("id", careLogId).eq("user_id", profile.id).is("deleted_at", null).maybeSingle();
  if (readError || !ownedCareLog) redirect("/care?error=delete");
  const admin = createAdminClient();
  const { error } = await admin.from("care_logs").update({ deleted_at: new Date().toISOString() }).eq("id", careLogId).eq("user_id", profile.id).is("deleted_at", null);
  if (error) redirect("/care?error=delete");
  revalidatePath("/care");
  redirect("/care?deleted=1");
}
