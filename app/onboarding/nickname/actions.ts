"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export type NicknameState = { error: string | null };

export async function saveNickname(_: NicknameState, formData: FormData): Promise<NicknameState> {
  const user = await requireUser();
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (nickname.length < 2 || nickname.length > 20) {
    return { error: "닉네임은 2자 이상 20자 이하로 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ nickname }).eq("auth_user_id", user.id);
  if (error) return { error: "닉네임을 저장하지 못했어요. 잠시 후 다시 시도해주세요." };

  redirect("/care");
}
