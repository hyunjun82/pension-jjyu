import { Fragment } from "react";
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
  User,
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

function formatKoreanDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
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
    authors: [{ name: "기초연금 에디터", url: "https://pension.jjyu.co.kr" }],
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://pension.jjyu.co.kr/${decoded}/${decodedSlug}`,
      type: "article",
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      siteName: "기초연금 정보",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary",
      title: article.title,
      description: article.description,
    },
    alternates: {
      canonical: `https://pension.jjyu.co.kr/${decoded}/${decodedSlug}`,
    },
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

  // CTA를 본문 중간(약 절반 지점)에 삽입
  const ctaInsertIndex = Math.floor(article.sections.length / 2);

  return (
    <>
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
              <span className="font-medium text-slate-500">기초연금 에디터</span>
              {article.datePublished && (
                <>
                  <span className="text-slate-200">|</span>
                  <time dateTime={article.datePublished}>
                    {formatKoreanDate(article.datePublished)} 작성
                  </time>
                </>
              )}
              {article.dateModified &&
                article.dateModified !== article.datePublished && (
                  <>
                    <span className="text-slate-200">|</span>
                    <time dateTime={article.dateModified}>
                      {formatKoreanDate(article.dateModified)} 수정
                    </time>
                  </>
                )}
            </div>
            <div className="ml-auto">
              <ShareButtons title={article.title} />
            </div>
          </div>
        </header>

        {/* ── 상단 CTA ─────────────────────────────── */}
        <Link
          href="/#calculator"
          className="group mb-8 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-6 py-4 transition-all duration-200 hover:border-blue-200 hover:bg-blue-100/70"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[15px] font-bold text-slate-900">
                내 기초연금 수급액 계산해보기
              </span>
              <span className="block text-[13px] text-slate-500">
                소득·재산 정보만 입력하면 예상 수급액을 바로 확인할 수 있어요
              </span>
            </div>
          </div>
          <ArrowLeft className="h-4 w-4 rotate-180 text-blue-400 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* ── Two-column layout ───────────────────── */}
        <div className="flex gap-8">
          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Article sections with CTA inserted in the middle */}
            <article>
              {article.sections.map((section, idx) => {
                const { icon: SectionIcon, color } = getSectionIcon(
                  section.heading
                );
                return (
                  <Fragment key={idx}>
                    <section className="mb-8">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 ${color}`}
                        >
                          <SectionIcon className="h-4 w-4" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {section.heading}
                        </h2>
                      </div>
                      <div className="text-[15px] text-slate-600 leading-[1.85] sm:text-[16px] pl-[42px] space-y-3">
                        {section.content.split("\n\n").map((para, pIdx) => (
                          <p key={pIdx}>{para}</p>
                        ))}
                      </div>
                      {idx < article.sections.length - 1 && (
                        <div className="mt-8 border-t border-slate-100" />
                      )}
                    </section>

                    {/* 모의계산 CTA — 본문 중간에 삽입 */}
                    {idx === ctaInsertIndex && (
                      <div className="mb-8">
                        <Link
                          href="/#calculator"
                          className="group block w-full rounded-xl bg-blue-600 px-6 py-5 text-center text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-xl"
                        >
                          <span className="flex items-center justify-center gap-2 text-lg font-bold">
                            <Calculator className="h-5 w-5" />
                            내 기초연금 수급액 계산해보기
                          </span>
                          <span className="block text-sm text-blue-100 mt-1">
                            소득·재산 정보 입력으로 예상 수급액 즉시 확인 →
                          </span>
                        </Link>
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </article>

            {/* Related Articles */}
            <div className="mt-4">
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

            {/* 작성자 카드 */}
            <div className="mt-6 rounded-xl border border-slate-300 bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-slate-900">
                    기초연금 에디터
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500">
                      기초연금 제도 전문
                    </span>
                    <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500">
                      2026년 기준
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                    보건복지부·국민연금공단 공식 자료를 바탕으로 기초연금 정보를
                    쉽고 정확하게 전달합니다.
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[12px]">
                    <a
                      href="https://www.bokjiro.go.kr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 underline underline-offset-2 hover:text-slate-600"
                    >
                      복지로 공공데이터
                    </a>
                    <Link
                      href="/about"
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      작성자 소개 →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 참고 */}
            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-[12px] leading-relaxed text-slate-500">
                본 콘텐츠는 2026년 기초연금법 시행령·시행규칙을 기준으로
                작성되었습니다. 정확한 수급 자격과 금액은{" "}
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
            <div className="mt-6 pb-8">
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

      {/* ── JSON-LD: Article ─────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            datePublished: article.datePublished,
            dateModified: article.dateModified,
            author: {
              "@type": "Person",
              name: "기초연금 에디터",
              url: "https://pension.jjyu.co.kr",
              worksFor: {
                "@type": "Organization",
                name: "기초연금 정보",
              },
            },
            publisher: {
              "@type": "Organization",
              name: "기초연금 정보",
              url: "https://pension.jjyu.co.kr",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://pension.jjyu.co.kr/${decoded}/${decodedSlug}`,
            },
            inLanguage: "ko",
          }),
        }}
      />

      {/* ── JSON-LD: FAQPage ─────────────────────── */}
      {article.faq && article.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: article.faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            }),
          }}
        />
      )}

      {/* ── JSON-LD: BreadcrumbList ──────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "홈",
                item: "https://pension.jjyu.co.kr",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: cat.name,
                item: `https://pension.jjyu.co.kr/${decoded}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: article.title.split("|")[0].trim(),
                item: `https://pension.jjyu.co.kr/${decoded}/${decodedSlug}`,
              },
            ],
          }),
        }}
      />
    </>
  );
}
