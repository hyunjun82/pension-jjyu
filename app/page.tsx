import { ArrowRight } from "lucide-react";
import { PensionCalculator } from "@/components/PensionCalculator";
import { CategoryCard } from "@/components/CategoryCard";
import { InfoCard } from "@/components/InfoCard";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";

export default function HomePage() {
  const featuredArticles = Object.values(articles).flat().slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            2026년 기초연금 정보
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            기초연금, 얼마나 받을 수 있을까?
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-slate-500">
            만 65세 이상 어르신을 위한 기초연금. 소득·재산 정보를 입력하면
            예상 수급액을 바로 확인할 수 있습니다.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="bg-slate-50/50">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <PensionCalculator />
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900">
            기초연금 정보
          </h2>
          <span className="text-[12px] text-slate-400">
            {categories.length}개 카테고리
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const categoryArticles = articles[category.slug] || [];
            return (
              <CategoryCard
                key={category.slug}
                category={category}
                count={categoryArticles.length}
              />
            );
          })}
        </div>
      </section>

      {/* 주요 정보 섹션 */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="mb-5 text-[15px] font-semibold text-slate-900">
          주요 안내
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {featuredArticles.map((article) => (
            <InfoCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {/* 안내 배너 */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-xl border border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-slate-800">
                기초연금, 직접 확인하세요
              </h3>
              <p className="mt-1 text-[12px] text-slate-400">
                보건복지부(129) 또는 국민연금공단(1355)에서 정확한 수급 자격을
                확인할 수 있습니다.
              </p>
            </div>
            <a
              href="https://www.bokjiro.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-slate-800"
            >
              복지로 바로가기
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
