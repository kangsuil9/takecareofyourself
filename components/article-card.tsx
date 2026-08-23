import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { Article } from "@/lib/articles";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/care/articles/${article.id}`} className="article-card">
      <div className={`article-visual ${article.accent}`} aria-hidden="true">
        <span className="visual-orbit" />
        <span className="visual-leaf" />
      </div>
      <div className="article-card-body">
        <div className="article-meta">
          <span>{article.category}</span>
          <span><Clock3 size={13} aria-hidden="true" /> {article.readingTime}</span>
        </div>
        <h2>{article.title}</h2>
        <p>{article.summary}</p>
        <span className="text-link">읽어보기 <ArrowUpRight size={15} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
