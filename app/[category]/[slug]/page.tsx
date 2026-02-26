import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";
import type { Metadata } from "next";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-gray-600">
          홈
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/${decoded}`} className="hover:text-gray-600">
          {cat.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-gray-700">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">
          <span>{cat.icon}</span>
          <span className="font-medium">{cat.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {article.title}
        </h1>
        <p className="mt-3 text-base text-gray-500">{article.description}</p>
      </header>

      {/* Article Body */}
      <div className="space-y-8">
        {article.sections.map((section, idx) => (
          <section
            key={idx}
            className="rounded-xl border border-gray-100 bg-white p-6"
          >
            <h2 className="mb-3 text-lg font-bold text-gray-800">
              {section.heading}
            </h2>
            <p className="leading-relaxed text-gray-600">{section.content}</p>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <p className="text-sm text-gray-600">
          더 자세한 내용은{" "}
          <strong>국민연금공단(☎ 1355)</strong> 또는{" "}
          <a
            href="https://www.bokjiro.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 underline hover:text-blue-700"
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
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {cat.name} 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
