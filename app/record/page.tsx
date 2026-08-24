import { AppShell } from "@/components/app-shell";
import { CareLogForm } from "@/components/care-log-form";
import { createCareLog } from "@/app/record/actions";

export default function RecordPage() {
  return (
    <AppShell>
      <header className="simple-header"><span className="eyebrow">MY CARE</span><h1>오늘의 나를 돌보기</h1><p>크고 특별하지 않아도 괜찮아요.<br />오늘 나를 위해 한 일을 남겨보세요.</p></header>
      <CareLogForm action={createCareLog} submitLabel="기록하기" />
    </AppShell>
  );
}
