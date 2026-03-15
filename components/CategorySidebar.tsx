import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SidebarProps {
  categorySlug: string;
  categoryName: string;
  articles: { slug: string; title: string }[];
  currentSlug: string;
}

export function CategorySidebar({
  categorySlug,
  categoryName,
  articles,
  currentSlug,
}: SidebarProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 w-56 xl:w-64">
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <Link
              href={`/${categorySlug}`}
              className="text-[12px] font-semibold text-slate-800 transition-colors hover:text-slate-600"
            >
              {categoryName}
            </Link>
          </div>
          <nav className="max-h-[60vh] overflow-y-auto p-2">
            <ul className="space-y-0.5">
              {articles.map((article) => {
                const isCurrent = article.slug === currentSlug;
                // Truncate long titles for sidebar display
                const shortTitle =
                  article.title.split("|")[0].trim().length > 24
                    ? article.title.split("|")[0].trim().slice(0, 24) + "…"
                    : article.title.split("|")[0].trim();
                return (
                  <li key={article.slug}>
                    <Link
                      href={`/${categorySlug}/${article.slug}`}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] leading-snug transition-colors ${
                        isCurrent
                          ? "border-l-2 border-slate-900 bg-slate-50 font-semibold text-slate-900"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      {isCurrent && (
                        <ChevronRight className="h-3 w-3 shrink-0" />
                      )}
                      <span>{shortTitle}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-slate-100 p-3">
            <Link
              href={`/${categorySlug}`}
              className="flex items-center justify-center gap-1 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              {categoryName} 전체보기
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 사이드바 광고 */}
        <div className="mt-4">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-2442517902625121"
            data-ad-slot=""
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </aside>
  );
}
