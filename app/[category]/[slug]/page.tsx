import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  Calculator,
  UserCheck,
  FileText,
  Wallet,
  BarChart3,
  HelpCircle,
  Building2,
  ShieldCheck,
  TrendingDown,
  ClipboardList,
  Landmark,
  Home,
  Calendar,
  Coins,
  Scale,
  AlertTriangle,
  Info,
} from "lucide-react";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";
import { FAQSection } from "@/components/FAQSection";
import { CategorySidebar } from "@/components/CategorySidebar";
import { ShareButtons } from "@/components/ShareButtons";
import { RelatedArticles } from "@/components/RelatedArticles";
import type { Metadata } from "next";

// ── Category icon map ─────────────────────────────────────
const catIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  UserCheck,
  FileText,
  Wallet,
  BarChart3,
  HelpCircle,
  Building2,
};

// ── Section icon map (keyword → icon) ─────────────────────
type IconEntry = {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const SECTION_ICONS: Record<string, IconEntry> = {
  나이: { icon: UserCheck, color: "text-blue-500" },
  자격: { icon: ShieldCheck, color: "text-blue-500" },
  요건: { icon: ShieldCheck, color: "text-blue-500" },
  선정기준: { icon: BarChart3, color: "text-indigo-500" },
  소득인정액: { icon: BarChart3, color: "text-indigo-500" },
  소득평가: { icon: BarChart3, color: "text-indigo-500" },
  재산: { icon: Home, color: "text-amber-500" },
  환산: { icon: Coins, color: "text-amber-500" },
  공제: { icon: TrendingDown, color: "text-emerald-500" },
  근로소득: { icon: Wallet, color: "text-emerald-500" },
  감액: { icon: TrendingDown, color: "text-red-500" },
  부부: { icon: Scale, color: "text-purple-500" },
  국민연금: { icon: Landmark, color: "text-blue-600" },
  연계: { icon: Landmark, color: "text-blue-600" },
  직역: { icon: Building2, color: "text-orange-500" },
  제외: { icon: AlertTriangle, color: "text-orange-500" },
  주의: { icon: AlertTriangle, color: "text-orange-500" },
  신청: { icon: FileText, color: "text-teal-500" },
  서류: { icon: ClipboardList, color: "text-teal-500" },
  온라인: { icon: FileText, color: "text-teal-500" },
  찾아뵙는: { icon: Home, color: "text-teal-500" },
  대리: { icon: FileText, color: "text-teal-500" },
  위임: { icon: FileText, color: "text-teal-500" },
  지급: { icon: Calendar, color: "text-green-500" },
  수령: { icon: Calendar, color: "text-green-500" },
  입금: { icon: Calendar, color: "text-green-500" },
  금융: { icon: Coins, color: "text-yellow-600" },
  부채: { icon: TrendingDown, color: "text-rose-500" },
  공공: { icon: Building2, color: "text-sky-500" },
  복지: { icon: Building2, color: "text-sky-500" },
  장기요양: { icon: HelpCircle, color: "text-violet-500" },
  기초생활: { icon: Building2, color: "text-sky-500" },
  변경: { icon: Info, color: "text-indigo-500" },
  인상: { icon: TrendingDown, color: "text-green-600" },
  계산: { icon: Calculator, color: "text-slate-600" },
  공식: { icon: Calculator, color: "text-slate-600" },
  무료임차: { icon: Home, color: "text-amber-600" },
  해외: { icon: Info, color: "text-blue-500" },
  국적: { icon: Info, color: "text-blue-500" },
};

function getSectionIcon(heading: string): IconEntry {
  for (const [keyword, entry] of Object.entries(SECTION_ICONS)) {
    if (heading.includes(keyword)) return entry;
  }
  return { icon: Info, color: "text-slate-400" };
}

// ── Page props ────────────────────────────────────────────
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

// ── Page component ────────────────────────────────────────
export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params;
  const decoded = decodeURIComponent(category);
  const decodedSlug = decodeURIComponent(slug);

  const cat = categories.find((c) => c.slug === decoded);
  if (!cat) notFound();

  const catArticles = articles[decoded] || [];
  const article = catArticles.find((a) => a.slug === decodedSlug);
  if (!article) notFound();

  const CatIcon = catIconMap[cat.icon];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* ── Breadcrumb ──────────────────────────── */}
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
        <span className="font-medium text-slate-600">
          {article.title.split("|")[0].trim()}
        </span>
      </nav>

      {/* ── Hero Header ─────────────────────────── */}
      <header className="mb-8 rounded-xl border border-slate-100 bg-white p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500">
          {CatIcon && <CatIcon className="h-3.5 w-3.5" />}
          {cat.name}
        </div>
        <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl">
          {article.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-slate-500">
          {article.heroDescription || article.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>기초연금 정보</span>
            {article.datePublished && (
              <>
                <span className="text-slate-200">|</span>
                <span>{article.datePublished}</span>
              </>
            )}
            {article.dateModified && (
              <>
                <span className="text-slate-200">|</span>
                <span>수정 {article.dateModified}</span>
              </>
            )}
          </div>
          <div className="ml-auto">
            <ShareButtons title={article.title} />
          </div>
        </div>
      </header>

      {/* ── Two-column layout ───────────────────── */}
      <div className="flex gap-8">
        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Article sections */}
          <div className="space-y-4">
            {article.sections.map((section, idx) => {
              const { icon: SectionIcon, color } = getSectionIcon(
                section.heading
              );
              return (
                <section
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-white p-5 sm:p-6"
                >
                  <div className="mb-3 flex items-start gap-2.5">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-50 ${color}`}
                    >
                      <SectionIcon className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="text-[15px] font-semibold leading-snug text-slate-800">
                      {section.heading}
                    </h2>
                  </div>
                  <div className="space-y-3 pl-8">
                    {section.content.split("\n\n").map((para, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-[14px] leading-relaxed text-slate-500"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* 모의계산 CTA */}
          <div className="mt-6 rounded-xl border border-slate-900 bg-slate-900 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-slate-300" />
                  <span className="text-[13px] font-semibold text-slate-200">
                    내 기초연금 수급 여부 바로 확인
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-slate-400">
                  소득·재산 정보를 입력하면 소득인정액과 예상 수급액을 즉시
                  계산합니다.
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

          {/* Related Articles */}
          <div className="mt-6">
            <RelatedArticles
              categorySlug={decoded}
              categoryName={cat.name}
              articles={catArticles}
              currentSlug={decodedSlug}
            />
          </div>

          {/* FAQ */}
          {article.faq && article.faq.length > 0 && (
            <div className="mt-6">
              <FAQSection items={article.faq} />
            </div>
          )}

          {/* 참고 */}
          <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-[12px] leading-relaxed text-slate-500">
              본 콘텐츠는 2026년 기초연금법 시행령·시행규칙을 기준으로 작성되었습니다.
              정확한 수급 자격과 금액은{" "}
              <strong className="text-slate-600">
                국민연금공단(1355)
              </strong>{" "}
              또는{" "}
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
        </main>

        {/* Sidebar */}
        <CategorySidebar
          categorySlug={decoded}
          categoryName={cat.name}
          articles={catArticles.map((a) => ({
            slug: a.slug,
            title: a.title,
          }))}
          currentSlug={decodedSlug}
        />
      </div>
    </div>
  );
}
