import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Article } from "@/data/articles";

export function InfoCard({ article }: { article: Article }) {
  return (
    <Link href={`/${article.category}/${article.slug}`}>
      <div className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 transition-all duration-200 hover:border-blue-200 hover:shadow-sm">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-800 group-hover:text-blue-600">
            {article.title}
          </h3>
          <p className="mt-1 truncate text-xs text-gray-400">
            {article.description}
          </p>
        </div>
        <ChevronRight className="ml-3 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-blue-500" />
      </div>
    </Link>
  );
}
