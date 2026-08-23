import { NextResponse } from "next/server";
import { ensureServiceProfile } from "@/lib/auth/onboarding";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/care";

  if (!code) return NextResponse.redirect(new URL("/login?error=oauth", url.origin));

  try {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;

    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) throw userError ?? new Error("Authenticated user missing");

    const profile = await ensureServiceProfile(data.user);
    return NextResponse.redirect(new URL(profile.nickname ? next : "/onboarding/nickname", url.origin));
  } catch {
    return NextResponse.redirect(new URL("/login?error=callback", url.origin));
  }
}
