import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import {
  UserCheck,
  FileText,
  Wallet,
  BarChart3,
  HelpCircle,
  Building2,
} from "lucide-react";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";
import type { Metadata } from "next";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck,
  FileText,
  Wallet,
  BarChart3,
  HelpCircle,
  Building2,
};

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  const cat = categories.find((c) => c.slug === decoded);
  if (!cat) return {};

  return {
    title: `${cat.name} | 기초연금 정보`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  const cat = categories.find((c) => c.slug === decoded);

  if (!cat) notFound();

  const categoryArticles = articles[decoded] || [];
  const Icon = iconMap[cat.icon];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-[12px] text-slate-400">
        <Link href="/" className="transition-colors hover:text-slate-600">
          홈
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-700">{cat.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8 rounded-xl border border-slate-100 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-50">
            {Icon && <Icon className="h-5 w-5 text-slate-600" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{cat.name}</h1>
            <p className="mt-0.5 text-[13px] text-slate-400">
              {cat.description}
            </p>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-2">
        {categoryArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/${decoded}/${article.slug}`}
            className="group flex items-center justify-between rounded-lg border border-slate-100 bg-white px-5 py-4 transition-all duration-200 hover:border-slate-200 hover:shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <h2 className="text-[14px] font-semibold text-slate-800 transition-colors group-hover:text-slate-900">
                {article.title}
              </h2>
              <p className="mt-1 truncate text-[12px] text-slate-400">
                {article.description}
              </p>
            </div>
            <ChevronRight className="ml-4 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
          </Link>
        ))}

        {categoryArticles.length === 0 && (
          <div className="rounded-lg border border-slate-100 bg-white py-12 text-center">
            <p className="text-[13px] text-slate-400">
              아직 등록된 글이 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          전체 카테고리 보기
        </Link>
      </div>
    </div>
  );
}
