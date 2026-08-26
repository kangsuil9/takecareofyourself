import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MyCareLogList, type MyCareLogItem } from "@/components/my-care-log-list";
import { createCareImageSignedUrl } from "@/lib/care-logs/images";
import { getCategoryCounts, getReflectionPeriodDisplay, getReflectionRange, type ReflectionPeriod } from "@/lib/care-logs/reflection";
import { requireCareLogOwner } from "@/lib/care-logs/server";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ period?: string }> };

export default async function MePage({ searchParams }: Props) {
  const [profile, params] = await Promise.all([requireCareLogOwner(), searchParams]);
  const period: ReflectionPeriod = params.period === "month" ? "month" : "week";
  const range = getReflectionRange(period);
  const periodDisplay = getReflectionPeriodDisplay(period, range);
  const supabase = await createClient();
  const { data, error } = await supabase.from("care_logs").select("id, category, content, image_url, created_at").eq("user_id", profile.id).is("deleted_at", null).gte("created_at", range.start.toISOString()).lte("created_at", range.end.toISOString()).order("created_at", { ascending: false });
  const careLogs = data ?? [];
  const categoryCounts = getCategoryCounts(careLogs);
  const records: MyCareLogItem[] = await Promise.all(careLogs.map(async (careLog) => ({ id: careLog.id, category: careLog.category, content: careLog.content, created_at: careLog.created_at, imageUrl: await createCareImageSignedUrl(supabase, careLog.image_url) })));
  const nickname = profile.nickname ?? "돌봄 사용자";

  return <AppShell>
    <header className="profile-header"><span className="eyebrow">MY PAGE</span><div className="profile-row"><div className="profile-avatar">{nickname.slice(0, 1)}</div><div><p>반가워요,</p><h1>{nickname}님</h1></div></div></header>
    <nav className="reflection-tabs" aria-label="회고 기간">
      <Link href="/me?period=week" className={period === "week" ? "active" : ""} aria-current={period === "week" ? "page" : undefined}>이번 주</Link>
      <Link href="/me?period=month" className={period === "month" ? "active" : ""} aria-current={period === "month" ? "page" : undefined}>이번 달</Link>
    </nav>
    <div className="reflection-period" aria-live="polite">
      <strong>{periodDisplay.dateRange}</strong>
      <span>{periodDisplay.detail}</span>
    </div>
    <section className="reflection-section" aria-labelledby="reflection-title">
      <div className="section-heading"><div><span className="eyebrow">REFLECTION</span><h2 id="reflection-title">{range.label}의 나</h2></div><CalendarDays size={21} aria-hidden="true" /></div>
      {error ? <div className="reflection-empty"><p>돌봄 기록을 불러오지 못했어요.<br />잠시 후 다시 확인해주세요.</p></div> : <div className="reflection-summary">
        <div className="reflection-total"><strong>{careLogs.length}</strong><span>번의 돌봄</span></div>
        {careLogs.length ? <div className="reflection-category-list">{categoryCounts.categories.map(([category, count]) => <div className="reflection-category-row" key={category}><span>{category}</span><strong>{count}회</strong></div>)}{categoryCounts.uncategorized ? <div className="reflection-category-row uncategorized"><span>주제 없이 기록</span><strong>{categoryCounts.uncategorized}회</strong></div> : null}</div> : <p className="reflection-zero">아직 기록된 돌봄이 없어요.</p>}
      </div>}
      <p className="reflection-copy">무엇을 많이 했는지보다,<br />어떻게 나를 돌봤는지 바라보세요.</p>
    </section>
    <section className="period-records" aria-labelledby="period-records-title"><div className="section-heading"><div><span className="eyebrow">MY MOMENTS</span><h2 id="period-records-title">{range.label}의 기록</h2></div></div>{error ? null : <MyCareLogList careLogs={records} />}</section>
    <Link href="/me/records" className="outline-button">나의 전체 기록 보기 <ArrowRight size={17} aria-hidden="true" /></Link>
    {profile.role === "ADMIN" ? <section className="me-admin-section" aria-labelledby="me-admin-title"><span className="eyebrow">ADMIN</span><h2 id="me-admin-title">관리자</h2><Link href="/admin/articles">건강지식 관리 <ArrowRight size={15} aria-hidden="true" /></Link></section> : null}
  </AppShell>;
}
