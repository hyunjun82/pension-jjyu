import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedProps {
  categorySlug: string;
  categoryName: string;
  articles: { slug: string; title: string; description: string }[];
  currentSlug: string;
}

export function RelatedArticles({
  categorySlug,
  categoryName,
  articles,
  currentSlug,
}: RelatedProps) {
  const related = articles
    .filter((a) => a.slug !== currentSlug)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5">
      <h3 className="mb-3 text-[13px] font-semibold text-slate-800">
        {categoryName} 관련 글
      </h3>
      <div className="space-y-2">
        {related.map((article) => (
          <Link
            key={article.slug}
            href={`/${categorySlug}/${article.slug}`}
            className="group block rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
          >
            <p className="text-[12px] font-medium leading-snug text-slate-700 group-hover:text-slate-900">
              {article.title.split("|")[0].trim()}
            </p>
            <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">
              {article.description}
            </p>
          </Link>
        ))}
      </div>
      <Link
        href={`/${categorySlug}`}
        className="mt-3 flex items-center gap-1 text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        {categoryName} 전체보기
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
