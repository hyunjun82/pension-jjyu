import type { Metadata } from "next";
import Link from "next/link";
import {
  User,
  FileSearch,
  Database,
  ShieldCheck,
  UserCheck,
  FileText,
  Wallet,
  BarChart3,
  HelpCircle,
  Building2,
  ArrowLeft,
} from "lucide-react";

export const metadata: Metadata = {
  title: "작성자 소개 | 기초연금 정보",
  description:
    "기초연금 정보 콘텐츠의 작성 방법론, 데이터 출처, 편집 정책을 안내합니다.",
};

const categoryIcons: Record<string, React.ElementType> = {
  UserCheck,
  FileText,
  Wallet,
  BarChart3,
  HelpCircle,
  Building2,
};

const categories = [
  { name: "수급자격", icon: "UserCheck", desc: "나이·소득·국적 요건 등 수급 자격 판단 기준" },
  { name: "소득인정액", icon: "BarChart3", desc: "소득평가액·재산 소득환산액 계산 방법" },
  { name: "지급금액", icon: "Wallet", desc: "기준연금액, 감액 사유, 실수령액 안내" },
  { name: "신청방법", icon: "FileText", desc: "방문·온라인 신청 절차 및 필요 서류" },
  { name: "자주 묻는 질문", icon: "HelpCircle", desc: "기초연금 관련 대표 Q&A" },
  { name: "관련 제도", icon: "Building2", desc: "기초생활보장, 장기요양 등 연계 복지" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* 프로필 헤더 */}
      <div className="mb-10 flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <User className="h-7 w-7 text-slate-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">기초연금 에디터</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            기초연금 제도 전문 · 2026년 기초연금법 기준
          </p>
        </div>
      </div>

      {/* 소개 */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-slate-900">소개</h2>
        <div className="space-y-3 text-[15px] leading-relaxed text-slate-600">
          <p>
            보건복지부·국민연금공단의 공식 자료와 기초연금법 시행령·시행규칙을
            바탕으로, 기초연금 관련 정보를 쉽고 정확하게 전달하고 있어요.
          </p>
          <p>
            복잡한 제도 내용을 어르신과 보호자 분들이 이해하기 쉬운 말로
            풀어내는 것을 가장 중요하게 생각해요. 수급자격, 소득인정액 계산,
            신청 절차 등 실질적으로 도움이 되는 정보에 집중하고 있어요.
          </p>
        </div>
      </section>

      {/* 콘텐츠 작성 방법론 */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <FileSearch className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">
            콘텐츠 작성 방법론
          </h2>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
          <ol className="space-y-3 text-[14px] leading-relaxed text-slate-600">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-bold text-slate-500 shadow-sm">
                1
              </span>
              <span>
                보건복지부 고시·기초연금법 시행령 원문을 확인하여 정확한 기준
                수치(선정기준액, 기준연금액, 공제액 등)를 수집해요.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-bold text-slate-500 shadow-sm">
                2
              </span>
              <span>
                국민연금공단 기초연금 안내 페이지, 복지로 공공데이터를 교차
                확인하여 오류를 최소화해요.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-bold text-slate-500 shadow-sm">
                3
              </span>
              <span>
                전문 용어를 일상적인 표현(~에요/~해요 대화체)으로 풀어 쓰고,
                실제 사례와 함께 설명해요.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-bold text-slate-500 shadow-sm">
                4
              </span>
              <span>
                법령 개정이나 기준 변경 시 해당 콘텐츠를 즉시 업데이트하고,
                수정일을 표기해요.
              </span>
            </li>
          </ol>
        </div>
      </section>

      {/* 데이터 출처 */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <Database className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">데이터 출처</h2>
        </div>
        <div className="space-y-2 text-[14px] leading-relaxed text-slate-600">
          <p>
            모든 콘텐츠는 아래의 공식 출처를 기반으로 작성돼요.
          </p>
          <ul className="mt-3 space-y-2 pl-1">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>
                <strong className="text-slate-700">보건복지부</strong> — 기초연금법,
                시행령·시행규칙, 선정기준액 고시
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>
                <strong className="text-slate-700">국민연금공단</strong> — 기초연금
                안내, 모의계산기, 신청 서식
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>
                <strong className="text-slate-700">복지로</strong> — 복지 서비스
                통합 안내, 공공데이터 API
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>
                <strong className="text-slate-700">법제처 국가법령정보센터</strong> —
                기초연금법 원문, 개정 이력
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* 편집 정책 */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">편집 정책</h2>
        </div>
        <div className="space-y-3 text-[14px] leading-relaxed text-slate-600">
          <p>
            콘텐츠 정확성과 신뢰성을 위해 다음의 편집 정책을 따르고 있어요.
          </p>
          <ul className="space-y-2 pl-1">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              보건복지부·국민연금공단 공식 자료만을 1차 출처로 사용해요.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              법령 개정 시 7일 이내에 해당 콘텐츠를 업데이트해요.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              수치·기준 정보에는 반드시 적용 연도를 명시해요.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              특정 금융 상품이나 서비스를 추천·광고하지 않아요.
            </li>
          </ul>
        </div>
      </section>

      {/* 다루는 카테고리 */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-slate-900">
          다루는 카테고리
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.icon];
            return (
              <div
                key={cat.name}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                  {Icon && <Icon className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-slate-800">
                    {cat.name}
                  </p>
                  <p className="text-[13px] text-slate-500">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 홈으로 돌아가기 */}
      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
