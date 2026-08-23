import { redirect } from "next/navigation";
import { KakaoLoginButton } from "@/app/login/kakao-login-button";
import { getCurrentProfile } from "@/lib/auth/guards";

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const [{ error, next }, profile] = await Promise.all([searchParams, getCurrentProfile()]);
  if (profile) redirect(profile.nickname ? "/care" : "/onboarding/nickname");

  const nextPath = next?.startsWith("/") && !next.startsWith("//") ? next : "/care";

  return (
    <main className="auth-frame">
      <section className="login-panel">
        <div className="login-symbol" aria-hidden="true"><span /></div>
        <span className="eyebrow">TAKE CARE OF YOURSELF</span>
        <h1>돌봄</h1>
        <p>다른 사람을 돌보느라 바쁜 하루에도<br />나를 위한 작은 자리를 남겨보세요.</p>
        {error ? <p className="form-error" role="alert">로그인에 실패했어요. 다시 시도해주세요.</p> : null}
        <KakaoLoginButton nextPath={nextPath} />
      </section>
    </main>
  );
}
