import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Article } from "@/data/articles";

export function InfoCard({ article }: { article: Article }) {
  return (
    <Link href={`/${article.category}/${article.slug}`}>
      <div className="group flex items-center justify-between rounded-lg border border-slate-100 bg-white px-5 py-4 transition-all duration-200 hover:border-slate-200 hover:shadow-sm">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-semibold text-slate-800 transition-colors group-hover:text-slate-900">
            {article.title}
          </h3>
          <p className="mt-1 truncate text-[12px] text-slate-400">
            {article.description}
          </p>
        </div>
        <ArrowUpRight className="ml-3 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
      </div>
    </Link>
  );
}
