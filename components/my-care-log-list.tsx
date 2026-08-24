import { CareLogImage } from "@/components/care-log-image";
import { formatCareLogDate } from "@/lib/care-logs/reflection";

export type MyCareLogItem = { id: string; category: string | null; content: string; created_at: string; imageUrl: string | null };

export function MyCareLogList({ careLogs, emptyMessage = "아직 기록된 돌봄이 없어요." }: { careLogs: MyCareLogItem[]; emptyMessage?: string }) {
  if (!careLogs.length) return <div className="my-records-empty"><h2>{emptyMessage}</h2><p>기록이 남는 날 다시 천천히 돌아볼 수 있어요.</p></div>;
  return <div className="my-record-list">{careLogs.map((careLog) => <article className="my-record-card" key={careLog.id}>
    <header><time dateTime={careLog.created_at}>{formatCareLogDate(careLog.created_at)}</time>{careLog.category ? <span className="category-chip">{careLog.category}</span> : null}</header>
    <p>{careLog.content}</p>
    {careLog.imageUrl ? <CareLogImage src={careLog.imageUrl} /> : null}
  </article>)}</div>;
}
