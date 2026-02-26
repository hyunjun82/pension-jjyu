import { Shield } from "lucide-react";
import { PensionCalculator } from "@/components/PensionCalculator";
import { CategoryCard } from "@/components/CategoryCard";
import { InfoCard } from "@/components/InfoCard";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";

export default function HomePage() {
  // 각 카테고리에서 첫 번째 글 가져오기
  const featuredArticles = Object.values(articles)
    .flat()
    .slice(0, 4);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgydjJoMzR6TTIgMzR2Mkgwdi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* 좌측 텍스트 */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-blue-100 backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                2025년 기초연금 정보
              </div>
              <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                기초연금,
                <br />
                <span className="text-blue-200">얼마나 받을 수 있을까?</span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-blue-100 sm:text-lg">
                만 65세 이상 어르신을 위한 기초연금.
                소득·재산 정보를 입력하면 예상 수급액을 바로 확인할 수 있습니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-blue-200">
                <span className="rounded-lg bg-white/10 px-3 py-1.5">✓ 모의계산</span>
                <span className="rounded-lg bg-white/10 px-3 py-1.5">✓ 수급자격</span>
                <span className="rounded-lg bg-white/10 px-3 py-1.5">✓ 신청안내</span>
              </div>
            </div>

            {/* 우측 계산기 */}
            <div className="w-full max-w-md lg:justify-self-end">
              <PensionCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          기초연금 정보
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          주요 안내
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {featuredArticles.map((article) => (
            <InfoCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {/* 안내 배너 */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                기초연금, 직접 확인하세요
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                국민연금공단(☎ 1355) 또는 가까운 주민센터에서 정확한 수급 자격을 확인할 수 있습니다.
              </p>
            </div>
            <a
              href="https://www.bokjiro.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              복지로 바로가기 →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
