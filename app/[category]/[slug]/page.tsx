import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Calculator } from "lucide-react";
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
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  const params: { category: string; slug: string }[] = [];
  for (const cat of categories) {
    const catArticles = articles[cat.slug] || [];
    for (const article of catArticles) {
      params.push({ category: cat.slug, slug: article.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const decoded = decodeURIComponent(category);
  const decodedSlug = decodeURIComponent(slug);
  const catArticles = articles[decoded] || [];
  const article = catArticles.find((a) => a.slug === decodedSlug);

  if (!article) return {};

  return {
    title: `${article.title} | 기초연금 정보`,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params;
  const decoded = decodeURIComponent(category);
  const decodedSlug = decodeURIComponent(slug);

  const cat = categories.find((c) => c.slug === decoded);
  if (!cat) notFound();

  const catArticles = articles[decoded] || [];
  const article = catArticles.find((a) => a.slug === decodedSlug);
  if (!article) notFound();

  const Icon = iconMap[cat.icon];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-[12px] text-slate-400">
        <Link href="/" className="transition-colors hover:text-slate-600">
          홈
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/${decoded}`}
          className="transition-colors hover:text-slate-600"
        >
          {cat.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-700">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] text-slate-500">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span className="font-medium">{cat.name}</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          {article.title}
        </h1>
        <p className="mt-2 text-[14px] text-slate-400">
          {article.description}
        </p>
      </header>

      {/* Article Body */}
      <div className="space-y-4">
        {article.sections.map((section, idx) => (
          <section
            key={idx}
            className="rounded-lg border border-slate-100 bg-white p-5"
          >
            <h2 className="mb-2.5 text-[15px] font-semibold text-slate-800">
              {section.heading}
            </h2>
            <p className="text-[14px] leading-relaxed text-slate-500">
              {section.content}
            </p>
          </section>
        ))}
      </div>

      {/* 모의계산 CTA */}
      <div className="mt-8 rounded-xl border border-slate-900 bg-slate-900 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-slate-300" />
              <span className="text-[13px] font-semibold text-slate-200">
                내 기초연금 수급 여부 바로 확인
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-slate-400">
              소득·재산 정보를 입력하면 소득인정액과 예상 수급액을 즉시 계산합니다.
            </p>
          </div>
          <Link
            href="/#calculator"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-100"
          >
            <Calculator className="h-3.5 w-3.5" />
            모의계산 바로가기
          </Link>
        </div>
      </div>

      {/* 참고 */}
      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <p className="text-[12px] text-slate-500">
          더 자세한 내용은{" "}
          <strong className="text-slate-600">국민연금공단(1355)</strong> 또는{" "}
          <a
            href="https://www.bokjiro.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            복지로
          </a>
          에서 확인하세요.
        </p>
      </div>

      {/* Back link */}
      <div className="mt-6">
        <Link
          href={`/${decoded}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {cat.name} 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
