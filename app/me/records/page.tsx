import { AppShell } from "@/components/app-shell";
import { MyCareLogList, type MyCareLogItem } from "@/components/my-care-log-list";
import { PageHeader } from "@/components/page-header";
import { createCareImageSignedUrl } from "@/lib/care-logs/images";
import { requireCareLogOwner } from "@/lib/care-logs/server";
import { createClient } from "@/lib/supabase/server";

export default async function MyRecordsPage() {
  const profile = await requireCareLogOwner();
  const supabase = await createClient();
  const { data, error } = await supabase.from("care_logs").select("id, category, content, image_url, created_at").eq("user_id", profile.id).is("deleted_at", null).order("created_at", { ascending: false });
  const records: MyCareLogItem[] = await Promise.all((data ?? []).map(async (careLog) => ({ id: careLog.id, category: careLog.category, content: careLog.content, created_at: careLog.created_at, imageUrl: await createCareImageSignedUrl(supabase, careLog.image_url) })));
  return <AppShell>
    <PageHeader title="나의 기록" backHref="/me" />
    <section className="all-records-intro"><span className="eyebrow">MY CARE HISTORY</span><h2>내가 나를 돌본 순간들</h2><p>크기나 횟수를 판단하지 않고, 남겨둔 기록을 천천히 살펴보세요.</p></section>
    {error ? <div className="my-records-empty"><h2>기록을 불러오지 못했어요.</h2><p>잠시 후 다시 확인해주세요.</p></div> : <MyCareLogList careLogs={records} />}
  </AppShell>;
}
