import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";
import type { Metadata } from "next";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-gray-600">
          홈
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-gray-700">{cat.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{cat.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{cat.name}</h1>
            <p className="mt-1 text-sm text-blue-100">{cat.description}</p>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {categoryArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/${decoded}/${article.slug}`}
            className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white px-6 py-5 transition-all duration-200 hover:border-blue-200 hover:shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-gray-800 group-hover:text-blue-600">
                {article.title}
              </h2>
              <p className="mt-1 truncate text-sm text-gray-400">
                {article.description}
              </p>
            </div>
            <ChevronRight className="ml-4 h-5 w-5 shrink-0 text-gray-300 transition-colors group-hover:text-blue-500" />
          </Link>
        ))}

        {categoryArticles.length === 0 && (
          <div className="rounded-xl bg-gray-50 py-12 text-center">
            <p className="text-gray-400">아직 등록된 글이 없습니다.</p>
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          전체 카테고리 보기
        </Link>
      </div>
    </div>
  );
}
