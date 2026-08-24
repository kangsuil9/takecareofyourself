import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CareLogActions } from "@/components/care-log-actions";
import { CareLogImage } from "@/components/care-log-image";
import { CareLikeButton } from "@/components/care-like-button";
import { createCareImageSignedUrl } from "@/lib/care-logs/images";
import { requireCareLogOwner } from "@/lib/care-logs/server";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ created?: string; updated?: string; deleted?: string; error?: string }> };

function formatCareLogTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return `오늘 ${new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit" }).format(date)}`;
  }
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function getFeedback(params: Awaited<Props["searchParams"]>) {
  if (params.created === "1") return "오늘의 돌봄을 기록했어요.";
  if (params.updated === "1") return "돌봄 기록을 수정했어요.";
  if (params.deleted === "1") return "돌봄 기록을 삭제했어요.";
  if (params.error === "delete") return "기록을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.";
  return null;
}

export default async function CarePage({ searchParams }: Props) {
  const [profile, params] = await Promise.all([requireCareLogOwner(), searchParams]);
  const supabase = await createClient();
  const { data: careLogs, error } = await supabase.from("care_logs").select("id, user_id, category, content, image_url, created_at, updated_at").is("deleted_at", null).order("created_at", { ascending: false });
  const profileIds = [...new Set((careLogs ?? []).map((careLog) => careLog.user_id))];
  const careLogIds = (careLogs ?? []).map((careLog) => careLog.id);
  const { data: feedProfiles } = profileIds.length ? await supabase.rpc("get_feed_profiles", { profile_ids: profileIds }) : { data: [] };
  const { data: likes } = careLogIds.length ? await supabase.from("likes").select("care_log_id, user_id").in("care_log_id", careLogIds) : { data: [] };
  const nicknames = new Map((feedProfiles ?? []).map((item) => [item.id, item.nickname]));
  const likeCounts = new Map<string, number>();
  const likedCareLogIds = new Set<string>();
  for (const like of likes ?? []) {
    likeCounts.set(like.care_log_id, (likeCounts.get(like.care_log_id) ?? 0) + 1);
    if (like.user_id === profile.id) likedCareLogIds.add(like.care_log_id);
  }
  const imageUrls = new Map(await Promise.all((careLogs ?? []).filter((item) => item.image_url).map(async (item) => [item.id, await createCareImageSignedUrl(supabase, item.image_url)] as const)));
  const feedback = getFeedback(params);

  return (
    <AppShell>
      <header className="brand-header"><div><span className="eyebrow">TAKE CARE OF YOURSELF</span><h1>돌봄</h1></div><div className="brand-mark" aria-hidden="true"><span /></div></header>
      {feedback ? <div className={params.error ? "care-feedback error" : "care-feedback"} role="status">{feedback}</div> : null}
      <section className="intro-section"><p>사람들은 자신을<br />이렇게 돌보고 있습니다.</p></section>
      <section className="knowledge-card">
        <div className="knowledge-art" aria-hidden="true"><span className="sun" /><span className="hill one" /><span className="hill two" /></div>
        <div className="knowledge-copy"><span className="card-kicker">오늘의 돌봄 지식 · 수면</span><h2>잠을 줄여 만든 나만의 시간은<br />정말 나를 위한 시간일까요?</h2><p>편안한 밤을 만드는 작은 단서를 살펴보세요.</p><Link href="/care/articles/restful-sleep" className="inline-link">천천히 읽어보기 <ArrowRight size={16} aria-hidden="true" /></Link></div>
      </section>
      <Link href="/care/articles" className="more-link">건강 이야기 더보기 <ArrowRight size={17} aria-hidden="true" /></Link>
      <section className="feed-section" aria-labelledby="care-feed-title">
        <div className="section-heading"><div><span className="eyebrow">OUR MOMENTS</span><h2 id="care-feed-title">오늘의 돌봄</h2></div><span className="muted-label">최신순</span></div>
        {error ? <div className="feed-empty"><h3>기록을 불러오지 못했어요.</h3><p>잠시 후 다시 확인해주세요.</p></div> : careLogs?.length ? (
          <div className="feed-list">
            {careLogs.map((post) => {
              const nickname = nicknames.get(post.user_id) ?? "돌봄 사용자";
              return <article className="feed-card" key={post.id}>
                <header className="feed-author"><div className="avatar" aria-hidden="true">{nickname.slice(0, 1)}</div><div><strong>{nickname}</strong><span>{formatCareLogTime(post.created_at)}</span></div>{post.category ? <span className="category-chip">{post.category}</span> : null}{post.user_id === profile.id ? <CareLogActions careLogId={post.id} /> : null}</header>
                <p>{post.content}</p>
                {imageUrls.get(post.id) ? <CareLogImage src={imageUrls.get(post.id)!} /> : null}
                <CareLikeButton careLogId={post.id} initialCount={likeCounts.get(post.id) ?? 0} initialLiked={likedCareLogIds.has(post.id)} />
              </article>;
            })}
          </div>
        ) : <div className="feed-empty"><h3>아직 돌봄 기록이 없어요.</h3><p>마음이 가는 날, 오늘의 돌봄을 남겨보세요.</p></div>}
      </section>
    </AppShell>
  );
}
