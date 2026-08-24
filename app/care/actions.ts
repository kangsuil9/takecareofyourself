"use server";

import { requireCareLogOwner } from "@/lib/care-logs/server";
import { createClient } from "@/lib/supabase/server";

export type CareLikeState = {
  liked: boolean;
  count: number;
  error: string | null;
};

export async function toggleCareLike(previous: CareLikeState, formData: FormData): Promise<CareLikeState> {
  const careLogId = String(formData.get("careLogId") ?? "");
  if (!careLogId) return { ...previous, error: "좋아요를 변경하지 못했어요." };

  const profile = await requireCareLogOwner();
  const supabase = await createClient();
  const { data: careLog, error: careLogError } = await supabase
    .from("care_logs")
    .select("id")
    .eq("id", careLogId)
    .is("deleted_at", null)
    .maybeSingle();

  if (careLogError || !careLog) {
    return { ...previous, error: "이 돌봄 기록에는 좋아요를 남길 수 없어요." };
  }

  const { data: existing, error: readError } = await supabase
    .from("likes")
    .select("id")
    .eq("care_log_id", careLogId)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (readError) return { ...previous, error: "좋아요를 변경하지 못했어요. 잠시 후 다시 시도해주세요." };

  let liked = false;
  if (existing) {
    const { error } = await supabase.from("likes").delete().eq("id", existing.id).eq("user_id", profile.id);
    if (error) return { ...previous, error: "좋아요를 취소하지 못했어요. 잠시 후 다시 시도해주세요." };
  } else {
    const { error } = await supabase.from("likes").insert({ care_log_id: careLogId, user_id: profile.id });
    if (error?.code === "23505") liked = true;
    else if (error) return { ...previous, error: "좋아요를 남기지 못했어요. 잠시 후 다시 시도해주세요." };
    else liked = true;
  }

  const { count, error: countError } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("care_log_id", careLogId);

  return {
    liked,
    count: countError ? Math.max(0, previous.count + (liked ? 1 : -1)) : (count ?? 0),
    error: countError ? "좋아요 수는 다음에 다시 확인해주세요." : null,
  };
}
