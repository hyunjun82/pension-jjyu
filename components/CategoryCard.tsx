import Link from "next/link";
import {
  UserCheck,
  FileText,
  Wallet,
  BarChart3,
  HelpCircle,
  Building2,
} from "lucide-react";
import type { Category } from "@/data/categories";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck,
  FileText,
  Wallet,
  BarChart3,
  HelpCircle,
  Building2,
};

export function CategoryCard({
  category,
  count,
}: {
  category: Category;
  count?: number;
}) {
  const Icon = iconMap[category.icon];

  return (
    <Link href={`/${category.slug}`}>
      <div className="group flex flex-col items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-5 text-center transition-all duration-200 hover:border-slate-200 hover:shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 transition-colors group-hover:bg-slate-100">
          {Icon && (
            <Icon className="h-[18px] w-[18px] text-slate-500 transition-colors group-hover:text-slate-700" />
          )}
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-slate-800">
            {category.name}
          </h3>
          {count !== undefined && (
            <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
              {count}개 항목
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
