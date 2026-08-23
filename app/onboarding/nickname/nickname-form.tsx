"use client";

import { useActionState } from "react";
import { saveNickname, type NicknameState } from "@/app/onboarding/nickname/actions";

const initialState: NicknameState = { error: null };

export function NicknameForm() {
  const [state, action, pending] = useActionState(saveNickname, initialState);

  return (
    <form action={action} className="nickname-form">
      <label htmlFor="nickname">닉네임</label>
      <input id="nickname" name="nickname" minLength={2} maxLength={20} required placeholder="어떻게 불러드릴까요?" autoComplete="nickname" />
      <p>공개 피드에는 닉네임만 표시됩니다.</p>
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      <button className="primary-button" type="submit" disabled={pending}>{pending ? "저장하는 중…" : "돌봄 시작하기"}</button>
    </form>
  );
}
