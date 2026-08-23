"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/supabase/env";

export function KakaoLoginButton({ nextPath = "/care" }: { nextPath?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signIn() {
    setError(null);
    setPending(true);

    try {
      const supabase = createClient();
      const callback = new URL("/auth/callback", getAppUrl());
      callback.searchParams.set("next", nextPath.startsWith("/") ? nextPath : "/care");
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: { redirectTo: callback.toString() },
      });
      if (signInError) throw signInError;
    } catch {
      setError("로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
      setPending(false);
    }
  }

  return (
    <div className="login-action">
      <button className="kakao-button" type="button" onClick={signIn} disabled={pending}>
        <span aria-hidden="true">K</span>
        {pending ? "카카오로 이동하는 중…" : "카카오로 계속하기"}
      </button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
