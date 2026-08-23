import "server-only";

import { getPublicSupabaseEnv } from "@/lib/supabase/env";

export function getServerSupabaseEnv() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey?.trim()) {
    throw new Error("필수 환경변수 SUPABASE_SERVICE_ROLE_KEY이(가) 설정되지 않았습니다.");
  }

  return {
    ...getPublicSupabaseEnv(),
    serviceRoleKey,
  };
}
