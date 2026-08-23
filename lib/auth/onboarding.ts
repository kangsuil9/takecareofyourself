import "server-only";

import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

function getKakaoProviderId(user: User) {
  const kakaoIdentity = user.identities?.find((identity) => identity.provider === "kakao");
  const providerId = kakaoIdentity?.identity_data?.sub ?? user.user_metadata?.sub;
  return typeof providerId === "string" ? providerId : user.id;
}

export async function ensureServiceProfile(user: User) {
  const admin = createAdminClient();
  const { data: existing, error: readError } = await admin
    .from("users")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing;

  const { data, error } = await admin
    .from("users")
    .insert({
      auth_user_id: user.id,
      provider: "kakao",
      provider_user_id: getKakaoProviderId(user),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
