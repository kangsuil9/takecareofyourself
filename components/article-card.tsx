import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { PublishedArticleSummary } from "@/lib/articles/public";

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

export function ArticleCard({ article }: { article: PublishedArticleSummary }) {
  return (
    <Link href={`/care/articles/${article.id}?from=articles`} className="article-card">
      {article.coverImageUrl ? <img className="article-card-cover" src={article.coverImageUrl} alt="" /> : <div className="article-visual sage" aria-hidden="true"><span className="visual-orbit" /><span className="visual-leaf" /></div>}
      <div className="article-card-body">
        <div className="article-meta">
          <span>{article.category}</span>
          {article.readingTime ? <span><Clock3 size={13} aria-hidden="true" /> {article.readingTime}분</span> : null}
        </div>
        <h2>{article.title}</h2>
        <p>{article.summary}</p>
        <small className="article-published-date">{formatPublishedDate(article.publishedAt)}</small>
        <span className="text-link">읽어보기 <ArrowUpRight size={15} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
