type PublicSupabaseEnv = {
  url: string;
  publishableKey: string;
};

function requireEnv(name: string, value: string | undefined) {
  if (!value?.trim()) {
    throw new Error(`필수 환경변수 ${name}이(가) 설정되지 않았습니다.`);
  }

  return value;
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  return {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: requireEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}

export function getAppUrl() {
  const value = requireEnv("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);

  try {
    return new URL(value).origin;
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL은 올바른 URL이어야 합니다.");
  }
}
