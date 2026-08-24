"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { softDeleteCareLog } from "@/app/record/actions";

export function CareLogActions({ careLogId }: { careLogId: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  function showDeleteDialog() { setOpen(false); dialogRef.current?.showModal(); }
  return (
    <div className="care-log-actions">
      <button type="button" className="feed-menu-button" aria-label="내 돌봄 기록 메뉴" aria-expanded={open} onClick={() => setOpen((value) => !value)}><MoreHorizontal size={20} aria-hidden="true" /></button>
      {open ? <div className="feed-menu" role="menu"><Link href={`/record/${careLogId}/edit`} role="menuitem">수정</Link><button type="button" role="menuitem" onClick={showDeleteDialog}>삭제</button></div> : null}
      <dialog className="delete-dialog" ref={dialogRef}>
        <div><h2>이 돌봄 기록을 삭제할까요?</h2><p>삭제한 기록은 피드에서 보이지 않아요.</p>
          <div className="dialog-actions"><button type="button" onClick={() => dialogRef.current?.close()}>취소</button><form action={softDeleteCareLog}><input type="hidden" name="careLogId" value={careLogId} /><button type="submit" className="danger-button">삭제</button></form></div>
        </div>
      </dialog>
    </div>
  );
}
