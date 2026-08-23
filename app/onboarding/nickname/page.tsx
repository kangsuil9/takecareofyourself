import { redirect } from "next/navigation";
import { NicknameForm } from "@/app/onboarding/nickname/nickname-form";
import { getCurrentProfile, requireUser } from "@/lib/auth/guards";

export default async function NicknamePage() {
  await requireUser();
  const profile = await getCurrentProfile();
  if (profile?.nickname) redirect("/care");

  return (
    <main className="auth-frame">
      <section className="onboarding-panel">
        <span className="eyebrow">WELCOME TO DOLBOM</span>
        <h1>돌봄에서 사용할<br />이름을 알려주세요.</h1>
        <p>실명일 필요는 없어요.<br />편안하게 불리고 싶은 이름이면 충분합니다.</p>
        <NicknameForm />
      </section>
    </main>
  );
}
