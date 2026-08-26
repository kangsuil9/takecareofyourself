import { ArticleEditor } from "@/components/article-editor";
import { createArticle } from "@/app/admin/articles/actions";

export default function NewArticlePage() {
  return <div className="admin-page"><ArticleEditor action={createArticle} heading="새 건강지식 아티클" /></div>;
}
