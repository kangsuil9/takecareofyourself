import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { articles, getArticle } from "@/lib/articles";

type Props = { params: Promise<{ articleId: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ articleId: article.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleId } = await params;
  const article = articles.find((item) => item.id === articleId);
  return article ? { title: article.title, description: article.summary } : {};
}

export default async function ArticleDetailPage({ params }: Props) {
  const { articleId } = await params;
  if (!articles.some((item) => item.id === articleId)) notFound();
  const article = getArticle(articleId);

  return (
    <AppShell>
      <PageHeader title="건강 이야기" backHref="/care/articles" />
      <article className="article-detail">
        <header><span className="category-chip">{article.category}</span><h1>{article.title}</h1><p>{article.summary}</p><span className="read-time">읽는 데 {article.readingTime}</span></header>
        <div className={`detail-visual ${article.accent}`} aria-hidden="true"><span /><i /></div>
        <div className="article-body">
          <p>하루가 끝난 뒤에야 비로소 나만의 시간이 시작된 것처럼 느껴질 때가 있습니다. 그래서 피곤한 줄 알면서도 잠드는 시간을 자꾸 미루게 되곤 하지요.</p>
          <h2>쉬는 시간도 나를 위한 시간이에요</h2>
          <p>잠은 하루를 포기하는 시간이 아니라, 오늘 애쓴 몸과 마음이 조용히 회복하는 시간입니다. 충분히 쉬는 것은 다음 날을 위한 의무가 아니라 지금의 나를 돌보는 일이기도 합니다.</p>
          <blockquote>좋은 돌봄은 완벽한 계획보다<br />내 상태를 알아차리는 데서 시작됩니다.</blockquote>
          <h2>작고 편안한 신호 만들기</h2>
          <p>잠들기 전 조명을 조금 낮추거나, 휴대전화를 손이 닿지 않는 곳에 두는 것처럼 부담 없는 신호 하나를 만들어보세요. 매일 지켜야 하는 규칙일 필요는 없습니다.</p>
        </div>
        <footer className="article-closing"><span>오늘 나를 위해 할 수 있는 작은 돌봄</span><p>지금 내 몸이 무엇을 필요로 하는지<br />잠시 귀 기울여보는 건 어떨까요?</p></footer>
      </article>
    </AppShell>
  );
}
