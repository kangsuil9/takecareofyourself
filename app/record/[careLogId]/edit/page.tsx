import { notFound } from "next/navigation";
import { updateCareLog } from "@/app/record/actions";
import { AppShell } from "@/components/app-shell";
import { CareLogForm } from "@/components/care-log-form";
import { PageHeader } from "@/components/page-header";
import { requireCareLogOwner } from "@/lib/care-logs/server";
import { createCareImageSignedUrl } from "@/lib/care-logs/images";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ careLogId: string }> };

export default async function EditCareLogPage({ params }: Props) {
  const { careLogId } = await params;
  const profile = await requireCareLogOwner();
  const supabase = await createClient();
  const { data } = await supabase.from("care_logs").select("id, category, content, image_url").eq("id", careLogId).eq("user_id", profile.id).is("deleted_at", null).maybeSingle();
  if (!data) notFound();
  const imageUrl = await createCareImageSignedUrl(supabase, data.image_url);
  return <AppShell><PageHeader title="돌봄 기록 수정" backHref="/care" /><header className="edit-record-intro"><span className="eyebrow">EDIT MY CARE</span><h1>오늘의 돌봄을<br />다시 다듬어보세요.</h1></header><CareLogForm action={updateCareLog} careLogId={data.id} initialCategory={data.category} initialContent={data.content} initialImageUrl={imageUrl} submitLabel="수정하기" /></AppShell>;
}
