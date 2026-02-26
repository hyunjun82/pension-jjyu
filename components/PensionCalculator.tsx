"use client";

import { useState, useCallback } from "react";
import { Calculator, ChevronRight, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">기초연금 모의계산</h2>
            <p className="text-sm text-blue-100">2025년 기준</p>
          </div>
        </div>
        {/* Step indicator */}
        <div className="mt-4 flex gap-2">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      <CardContent className="p-6">
        {/* Step 0: 가구유형 & 지역 */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                가구 유형
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setHousehold("single")}
                  className={`rounded-xl border-2 px-4 py-4 text-center transition-all ${
                    household === "single"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="block text-2xl">👤</span>
                  <span className="mt-1 block text-sm font-medium">단독가구</span>
                  <span className="mt-0.5 block text-xs text-gray-400">
                    선정기준 {(THRESHOLDS.single / 10000).toLocaleString()}만원
                  </span>
                </button>
                <button
                  onClick={() => setHousehold("couple")}
                  className={`rounded-xl border-2 px-4 py-4 text-center transition-all ${
                    household === "couple"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="block text-2xl">👫</span>
                  <span className="mt-1 block text-sm font-medium">부부가구</span>
                  <span className="mt-0.5 block text-xs text-gray-400">
                    선정기준 {(THRESHOLDS.couple / 10000).toLocaleString()}만원
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                거주 지역
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "metro" as RegionType, label: "대도시", sub: "특별·광역시" },
                  { value: "city" as RegionType, label: "중소도시", sub: "도의 시 지역" },
                  { value: "rural" as RegionType, label: "농어촌", sub: "도의 군 지역" },
                ].map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRegion(r.value)}
                    className={`rounded-xl border-2 px-3 py-3 text-center transition-all ${
                      region === r.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="block text-sm font-medium">{r.label}</span>
                    <span className="mt-0.5 block text-xs text-gray-400">{r.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep(1)}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              다음 단계
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 1: 소득 정보 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="mb-1 text-base font-semibold text-gray-800">소득 정보</h3>
              <p className="mb-4 text-xs text-gray-400">월 기준 금액을 만원 단위로 입력하세요</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                근로소득 <span className="text-gray-400">(만원/월)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={laborIncome}
                  onChange={(e) => setLaborIncome(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-right text-lg font-medium transition-colors focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  만원
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                108만원 공제 후 30% 추가 공제 적용
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                기타소득 <span className="text-gray-400">(만원/월)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-right text-lg font-medium transition-colors focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  만원
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                사업소득, 국민연금 등 공적이전소득 포함
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(0)}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                이전
              </Button>
              <Button
                onClick={() => setStep(2)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                다음 단계
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: 재산 정보 */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="mb-1 text-base font-semibold text-gray-800">재산 정보</h3>
              <p className="mb-4 text-xs text-gray-400">만원 단위로 입력하세요</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                일반재산 <span className="text-gray-400">(만원)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-right text-lg font-medium transition-colors focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  만원
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                토지, 건축물, 주택, 임차보증금 등
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                금융재산 <span className="text-gray-400">(만원)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={financialAssets}
                  onChange={(e) => setFinancialAssets(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-right text-lg font-medium transition-colors focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  만원
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                예금, 적금, 주식, 보험 등 (2,000만원 공제 적용)
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                부채 <span className="text-gray-400">(만원)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={debt}
                  onChange={(e) => setDebt(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-right text-lg font-medium transition-colors focus:border-blue-500 focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  만원
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                금융기관 대출금, 임대보증금 등
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                이전
              </Button>
              <Button
                onClick={calculate}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                계산하기
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: 결과 */}
        {step === 3 && result && (
          <div className="space-y-5">
            {/* 수급 여부 */}
            <div
              className={`rounded-2xl p-6 text-center ${
                result.isEligible
                  ? "bg-gradient-to-br from-blue-50 to-indigo-50"
                  : "bg-gradient-to-br from-gray-50 to-gray-100"
              }`}
            >
              <div
                className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${
                  result.isEligible ? "bg-blue-100" : "bg-gray-200"
                }`}
              >
                <span className="text-3xl">
                  {result.isEligible ? "✅" : "❌"}
                </span>
              </div>
              <h3
                className={`text-xl font-bold ${
                  result.isEligible ? "text-blue-700" : "text-gray-600"
                }`}
              >
                {result.isEligible
                  ? "수급 가능성이 높습니다"
                  : "수급이 어려울 수 있습니다"}
              </h3>
              {result.isEligible && (
                <p className="mt-2 text-3xl font-extrabold text-blue-600">
                  월 {result.estimatedAmount.toLocaleString()}원
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                예상 금액이며, 실제 금액과 다를 수 있습니다
              </p>
            </div>

            {/* 상세 내역 */}
            <div className="space-y-3 rounded-xl bg-gray-50 p-4">
              <h4 className="text-sm font-semibold text-gray-700">산정 내역</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">소득인정액</span>
                  <span className="font-semibold text-gray-800">
                    {result.incomeRecognition.toLocaleString()}원
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">선정기준액</span>
                  <span className="font-medium text-gray-600">
                    {result.threshold.toLocaleString()}원
                  </span>
                </div>
                <div className="my-1 h-px bg-gray-200" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">가구유형</span>
                  <span className="text-gray-600">
                    {household === "single" ? "단독가구" : "부부가구"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">기본재산 공제액</span>
                  <span className="text-gray-600">
                    {formatKRW(BASE_PROPERTY_DEDUCTION[region])}
                  </span>
                </div>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-xs leading-relaxed text-blue-700">
                본 계산 결과는 참고용이며, 실제 수급 여부는 국민연금공단의 심사를
                통해 결정됩니다. 정확한 확인은{" "}
                <strong>국민연금공단(☎ 1355)</strong>에 문의하세요.
              </p>
            </div>

            <Button
              onClick={reset}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RotateCcw className="h-4 w-4" />
              다시 계산하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
