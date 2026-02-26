"use client";

import { useState, useCallback } from "react";
import { Calculator, ChevronRight, RotateCcw, Check } from "lucide-react";

type HouseholdType = "single" | "couple";
type RegionType = "metro" | "city" | "rural";

interface CalcResult {
  incomeRecognition: number;
  isEligible: boolean;
  estimatedAmount: number;
  threshold: number;
}

const THRESHOLDS = {
  single: 2_280_000,
  couple: 3_648_000,
};

const BASE_PENSION = 334_810;
const COUPLE_REDUCTION = 0.8;

const BASE_PROPERTY_DEDUCTION: Record<RegionType, number> = {
  metro: 135_000_000,
  city: 85_000_000,
  rural: 72_500_000,
};

const FINANCIAL_DEDUCTION = 20_000_000;
const INCOME_CONVERSION_RATE = 0.04 / 12;

const LABOR_INCOME_DEDUCTION = 1_080_000;
const LABOR_INCOME_ADDITIONAL_DEDUCTION = 0.3;

function formatKRW(value: number): string {
  if (value >= 100_000_000) {
    const eok = Math.floor(value / 100_000_000);
    const man = Math.floor((value % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (value >= 10_000) {
    return `${Math.floor(value / 10_000).toLocaleString()}만원`;
  }
  return `${value.toLocaleString()}원`;
}

function parseManwon(input: string): number {
  const num = parseFloat(input);
  if (isNaN(num)) return 0;
  return num * 10_000;
}

export function PensionCalculator() {
  const [step, setStep] = useState(0);
  const [household, setHousehold] = useState<HouseholdType>("single");
  const [region, setRegion] = useState<RegionType>("metro");
  const [laborIncome, setLaborIncome] = useState("");
  const [otherIncome, setOtherIncome] = useState("");
  const [property, setProperty] = useState("");
  const [financialAssets, setFinancialAssets] = useState("");
  const [debt, setDebt] = useState("");
  const [result, setResult] = useState<CalcResult | null>(null);

  const calculate = useCallback(() => {
    const laborVal = parseManwon(laborIncome);
    const otherVal = parseManwon(otherIncome);
    const propertyVal = parseManwon(property);
    const financialVal = parseManwon(financialAssets);
    const debtVal = parseManwon(debt);

    // 소득평가액 계산
    const laborAfterDeduction = Math.max(0, laborVal - LABOR_INCOME_DEDUCTION);
    const laborFinal = laborAfterDeduction * (1 - LABOR_INCOME_ADDITIONAL_DEDUCTION);
    const monthlyIncome = laborFinal + otherVal;

    // 재산의 소득환산액 계산
    const propertyAfterDeduction = Math.max(0, propertyVal - BASE_PROPERTY_DEDUCTION[region]);
    const financialAfterDeduction = Math.max(0, financialVal - FINANCIAL_DEDUCTION);
    const netProperty = Math.max(0, propertyAfterDeduction + financialAfterDeduction - debtVal);
    const propertyIncome = netProperty * INCOME_CONVERSION_RATE;

    // 소득인정액
    const incomeRecognition = Math.round(monthlyIncome + propertyIncome);

    // 선정기준액
    const threshold = THRESHOLDS[household];
    const isEligible = incomeRecognition <= threshold;

    // 예상 수급액
    let estimatedAmount = 0;
    if (isEligible) {
      estimatedAmount = BASE_PENSION;
      if (household === "couple") {
        estimatedAmount = Math.round(BASE_PENSION * COUPLE_REDUCTION);
      }
      // 소득역전방지 감액
      const gap = threshold - incomeRecognition;
      if (gap < estimatedAmount) {
        estimatedAmount = Math.max(0, gap);
      }
    }

    setResult({ incomeRecognition, isEligible, estimatedAmount, threshold });
    setStep(3);
  }, [household, region, laborIncome, otherIncome, property, financialAssets, debt]);

  const reset = () => {
    setStep(0);
    setHousehold("single");
    setRegion("metro");
    setLaborIncome("");
    setOtherIncome("");
    setProperty("");
    setFinancialAssets("");
    setDebt("");
    setResult(null);
  };

  const stepLabels = ["기본정보", "소득", "재산"];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-lg shadow-slate-200/50">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <Calculator className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">
              기초연금 모의계산
            </h2>
            <p className="text-[11px] text-slate-400">2025년 기준</p>
          </div>
        </div>
        {/* Step indicator */}
        {step < 3 && (
          <div className="mt-3 flex items-center gap-1.5">
            {stepLabels.map((label, s) => (
              <div key={s} className="flex flex-1 items-center gap-1.5">
                <div className="flex flex-1 flex-col gap-1">
                  <span
                    className={`text-[10px] font-medium ${
                      s <= step ? "text-slate-700" : "text-slate-300"
                    }`}
                  >
                    {label}
                  </span>
                  <div
                    className={`h-[3px] w-full rounded-full transition-all duration-300 ${
                      s <= step ? "bg-slate-900" : "bg-slate-100"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Step 0: 가구유형 & 지역 */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="mb-2.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                가구 유형
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setHousehold("single")}
                  className={`rounded-lg border px-3 py-3 text-center transition-all ${
                    household === "single"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-[13px] font-medium">단독가구</span>
                  <span
                    className={`mt-0.5 block text-[11px] ${
                      household === "single" ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    기준 {(THRESHOLDS.single / 10000).toLocaleString()}만원
                  </span>
                </button>
                <button
                  onClick={() => setHousehold("couple")}
                  className={`rounded-lg border px-3 py-3 text-center transition-all ${
                    household === "couple"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-[13px] font-medium">부부가구</span>
                  <span
                    className={`mt-0.5 block text-[11px] ${
                      household === "couple" ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    기준 {(THRESHOLDS.couple / 10000).toLocaleString()}만원
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                거주 지역
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "metro" as RegionType, label: "대도시", sub: "특별·광역시" },
                  { value: "city" as RegionType, label: "중소도시", sub: "도의 시" },
                  { value: "rural" as RegionType, label: "농어촌", sub: "도의 군" },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRegion(r.value)}
                    className={`rounded-lg border px-2 py-2.5 text-center transition-all ${
                      region === r.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-[12px] font-medium">{r.label}</span>
                    <span
                      className={`mt-0.5 block text-[10px] ${
                        region === r.value ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {r.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-slate-800"
            >
              다음 단계
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Step 1: 소득 정보 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-800">소득 정보</h3>
              <p className="mt-0.5 text-[11px] text-slate-400">
                월 기준 금액을 만원 단위로 입력하세요
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-slate-500">
                근로소득 (만원/월)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={laborIncome}
                  onChange={(e) => setLaborIncome(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-12 text-right text-[15px] font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">
                  만원
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                108만원 공제 후 30% 추가 공제 적용
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-slate-500">
                기타소득 (만원/월)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-12 text-right text-[15px] font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">
                  만원
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                사업소득, 국민연금 등 공적이전소득 포함
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setStep(0)}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                이전
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-slate-800"
              >
                다음 단계
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 재산 정보 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-800">재산 정보</h3>
              <p className="mt-0.5 text-[11px] text-slate-400">만원 단위로 입력하세요</p>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-slate-500">
                일반재산 (만원)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-12 text-right text-[15px] font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">
                  만원
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                토지, 건축물, 주택, 임차보증금 등
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-slate-500">
                금융재산 (만원)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={financialAssets}
                  onChange={(e) => setFinancialAssets(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-12 text-right text-[15px] font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">
                  만원
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                예금, 적금, 주식, 보험 등 (2,000만원 공제)
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-slate-500">
                부채 (만원)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={debt}
                  onChange={(e) => setDebt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-12 text-right text-[15px] font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">
                  만원
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                금융기관 대출금, 임대보증금 등
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                이전
              </button>
              <button
                onClick={calculate}
                className="flex-1 rounded-lg bg-slate-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-slate-800"
              >
                계산하기
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 결과 */}
        {step === 3 && result && (
          <div className="space-y-4">
            {/* 수급 여부 */}
            <div
              className={`rounded-xl p-5 text-center ${
                result.isEligible ? "bg-emerald-50" : "bg-slate-50"
              }`}
            >
              <div
                className={`mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-full ${
                  result.isEligible
                    ? "bg-emerald-100"
                    : "bg-slate-200"
                }`}
              >
                {result.isEligible ? (
                  <Check className="h-6 w-6 text-emerald-600" />
                ) : (
                  <span className="text-xl text-slate-400">-</span>
                )}
              </div>
              <h3
                className={`text-[15px] font-semibold ${
                  result.isEligible ? "text-emerald-800" : "text-slate-500"
                }`}
              >
                {result.isEligible
                  ? "수급 가능성이 높습니다"
                  : "수급이 어려울 수 있습니다"}
              </h3>
              {result.isEligible && (
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  월 {result.estimatedAmount.toLocaleString()}원
                </p>
              )}
              <p className="mt-1 text-[11px] text-slate-400">
                예상 금액이며, 실제 금액과 다를 수 있습니다
              </p>
            </div>

            {/* 상세 내역 */}
            <div className="space-y-2 rounded-lg border border-slate-100 p-4">
              <h4 className="text-[12px] font-semibold text-slate-500">산정 내역</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-400">소득인정액</span>
                  <span className="font-semibold text-slate-800">
                    {result.incomeRecognition.toLocaleString()}원
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-400">선정기준액</span>
                  <span className="font-medium text-slate-600">
                    {result.threshold.toLocaleString()}원
                  </span>
                </div>
                <div className="my-1 h-px bg-slate-100" />
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-400">가구유형</span>
                  <span className="text-slate-600">
                    {household === "single" ? "단독가구" : "부부가구"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-400">기본재산 공제액</span>
                  <span className="text-slate-600">
                    {formatKRW(BASE_PROPERTY_DEDUCTION[region])}
                  </span>
                </div>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-[11px] leading-relaxed text-slate-500">
                본 계산 결과는 참고용이며, 실제 수급 여부는 국민연금공단의 심사를
                통해 결정됩니다. 정확한 확인은{" "}
                <strong className="text-slate-600">국민연금공단(1355)</strong>에
                문의하세요.
              </p>
            </div>

            <button
              onClick={reset}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              다시 계산하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
