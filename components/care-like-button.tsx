"use client";

import { useActionState } from "react";
import { Heart } from "lucide-react";
import { toggleCareLike, type CareLikeState } from "@/app/care/actions";

type Props = {
  careLogId: string;
  initialCount: number;
  initialLiked: boolean;
};

export function CareLikeButton({ careLogId, initialCount, initialLiked }: Props) {
  const initialState: CareLikeState = { liked: initialLiked, count: initialCount, error: null };
  const [state, action, pending] = useActionState(toggleCareLike, initialState);
  const label = state.liked ? "좋아요 취소" : "좋아요";

  return (
    <div className="care-like">
      <form action={action}>
        <input type="hidden" name="careLogId" value={careLogId} />
        <button className={state.liked ? "heart-button active" : "heart-button"} type="submit" aria-label={`${label}, 현재 ${state.count}개`} aria-pressed={state.liked} disabled={pending}>
          <Heart size={18} fill={state.liked ? "currentColor" : "none"} aria-hidden="true" />
          <span>{state.count}</span>
        </button>
      </form>
      {state.error ? <span className="like-error" role="status">{state.error}</span> : null}
    </div>
  );
}
