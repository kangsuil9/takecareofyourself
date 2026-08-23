import { AppShell } from "@/components/app-shell";
import { ArticleCard } from "@/components/article-card";
import { PageHeader } from "@/components/page-header";
import { articles } from "@/lib/articles";

export default function ArticlesPage() {
  return (
    <AppShell>
      <PageHeader title="건강 이야기" backHref="/care" />
      <section className="articles-intro"><span className="eyebrow">CARE STORIES</span><h2>나를 이해하는 작은 지식</h2><p>알게 되면, 나를 돌보는 일이<br />조금 더 자연스러워질 수 있어요.</p></section>
      <div className="article-list">{articles.map((article) => <ArticleCard article={article} key={article.id} />)}</div>
    </AppShell>
  );
}
