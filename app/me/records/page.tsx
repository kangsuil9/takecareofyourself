import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";

export default function MyRecordsPage() {
  return (
    <AppShell>
      <PageHeader title="나의 기록" backHref="/me" />
      <section className="empty-state"><div aria-hidden="true">◌</div><h2>아직 기록이 없어요.</h2><p>언젠가 돌아볼 오늘을<br />하나 남겨보세요.</p></section>
    </AppShell>
  );
}
