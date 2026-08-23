import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

const protectedPrefixes = ["/care", "/record", "/me"];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getPublicSupabaseEnv();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: claimsData } = await supabase.auth.getClaims();
  const authUserId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null;
  const { pathname } = request.nextUrl;

  if (!authUserId && (isProtectedPath(pathname) || pathname.startsWith("/admin"))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authUserId && pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (profile?.role !== "ADMIN") {
      const careUrl = request.nextUrl.clone();
      careUrl.pathname = "/care";
      careUrl.search = "";
      return NextResponse.redirect(careUrl);
    }
  }

  return response;
}
