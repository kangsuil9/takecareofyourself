import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ saved?: string }> };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default async function AdminArticlesPage({ searchParams }: Props) {
  const [params, supabase] = await Promise.all([searchParams, createClient()]);
  const { data: articles, error } = await supabase.from("articles").select("id, title, category, status, created_at, updated_at").order("updated_at", { ascending: false });
  const feedback = params.saved === "published" ? "아티클을 발행했어요." : params.saved === "draft" ? "초안을 저장했어요." : null;
  return <div className="admin-page">
    <header className="admin-page-heading"><div><span className="eyebrow">ARTICLE OPERATIONS</span><h1>건강지식 아티클</h1><p>돌봄의 언어와 구조로 건강지식을 관리합니다.</p></div><Link className="admin-primary-link" href="/admin/articles/new"><Plus size={17} /> 새 아티클 작성</Link></header>
    {feedback ? <p className="admin-feedback" role="status">{feedback}</p> : null}
    {error ? <div className="admin-empty">아티클을 불러오지 못했어요. migration과 권한을 확인해주세요.</div> : articles?.length ? <div className="admin-article-list">{articles.map((article) => <Link href={`/admin/articles/${article.id}/edit`} className="admin-article-row" key={article.id}><div><span className={`admin-status ${article.status.toLowerCase()}`}>{article.status}</span><h2>{article.title || "제목 없는 초안"}</h2><p>{article.category || "카테고리 미정"}</p></div><dl><div><dt>작성</dt><dd>{formatDate(article.created_at)}</dd></div><div><dt>수정</dt><dd>{formatDate(article.updated_at)}</dd></div></dl></Link>)}</div> : <div className="admin-empty">아직 작성된 아티클이 없어요.</div>}
  </div>;
}
