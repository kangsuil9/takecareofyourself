import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ArticleRenderer } from "@/components/article-renderer";
import { PageHeader } from "@/components/page-header";
import { getPublishedArticle } from "@/lib/articles/public";

type Props = { params: Promise<{ articleId: string }>; searchParams: Promise<{ from?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleId } = await params;
  const article = await getPublishedArticle(articleId);
  return article ? { title: article.title, description: article.summary } : {};
}

export default async function ArticleDetailPage({ params, searchParams }: Props) {
  const [{ articleId }, query] = await Promise.all([params, searchParams]);
  const article = await getPublishedArticle(articleId);
  if (!article) notFound();
  const backHref = query.from === "articles" ? "/care/articles" : "/care";
  const publishedDate = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" }).format(new Date(article.publishedAt));

  return (
    <AppShell>
      <PageHeader title="건강 이야기" backHref={backHref} />
      <article className="article-detail">
        <header><span className="category-chip">{article.category}</span><h1>{article.title}</h1><p>{article.summary}</p><span className="read-time">{article.readingTime ? `읽는 데 약 ${article.readingTime}분 · ` : ""}{publishedDate}</span></header>
        {article.coverImageUrl ? <img className="article-detail-cover" src={article.coverImageUrl} alt="" /> : null}
        <ArticleRenderer blocks={article.blocks} references={article.references} imageUrls={article.imageUrls} />
        <footer className="article-closing"><span>오늘 나를 위해 할 수 있는 작은 돌봄</span><p>지금 내 몸이 무엇을 필요로 하는지<br />잠시 귀 기울여보는 건 어떨까요?</p></footer>
      </article>
    </AppShell>
  );
}
