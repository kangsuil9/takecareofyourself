import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getServerSupabaseEnv } from "@/lib/supabase/env.server";

export function createAdminClient() {
  const { url, serviceRoleKey } = getServerSupabaseEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
