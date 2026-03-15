"use client";

import { useState, useCallback } from "react";
import { Calculator, RotateCcw, Check, ChevronDown } from "lucide-react";

// ── 2026년 기준 상수 ──────────────────────────────────────────
const THRESHOLDS = { single: 2_470_000, couple: 3_952_000 };
const BASE_PENSION = 349_700;
const COUPLE_REDUCTION = 0.8;
const BASE_PROPERTY_DEDUCTION: Record<Region, number> = {
  metro: 135_000_000,
  city: 85_000_000,
  rural: 72_500_000,
};
const FINANCIAL_DEDUCTION = 20_000_000;
const INCOME_CONVERSION_RATE = 0.04 / 12;
const LABOR_INCOME_DEDUCTION = 1_160_000;
const LABOR_ADDITIONAL_DEDUCTION_RATE = 0.3;
const LUXURY_CAR_THRESHOLD = 40_000_000;
const FREE_RENT_THRESHOLD = 600_000_000;
const FREE_RENT_ANNUAL_RATE = 0.0078;
const AIRCRAFT_SHIP_FACTOR = 3.5;
const DEPOSIT_FACTOR = 0.95;

// ── Types ──────────────────────────────────────────────────────
type Household = "single" | "couple";
type Region = "metro" | "city" | "rural";

interface FormState {
  household: Household;
  region: Region;
  laborIncome: string;
  laborIncomeSpouse: string;
  businessIncome: string;
  assetIncome: string;
  publicTransferIncome: string;
  freeRentShareRatio: string;
  freeRentValue: string;
  buildingValue: string;
  landValue: string;
  depositValue: string;
  otherPropertyValue: string;
  aircraftShipValue: string;
  membershipValue: string;
  carForBusiness: boolean;
  carCC: string;
  carValue: string;
  financialAssets: string;
  loanDebt: string;
  rentalDepositHouseValue: string;
  rentalDepositAmount: string;
}

interface CalcResult {
  laborIncomeReflected: number;
  otherIncome: number;
  freeRentIncomeCalc: number;
  monthlyIncomeEval: number;
  generalProperty: number;
  financialAfterDeduction: number;
  totalDebt: number;
  netProperty: number;
  pValue: number;
  propertyIncomeConversion: number;
  incomeRecognition: number;
  isEligible: boolean;
  estimatedAmount: number;
  threshold: number;
}

const initialForm: FormState = {
  household: "single",
  region: "metro",
  laborIncome: "",
  laborIncomeSpouse: "",
  businessIncome: "",
  assetIncome: "",
  publicTransferIncome: "",
  freeRentShareRatio: "",
  freeRentValue: "",
  buildingValue: "",
  landValue: "",
  depositValue: "",
  otherPropertyValue: "",
  aircraftShipValue: "",
  membershipValue: "",
  carForBusiness: false,
  carCC: "",
  carValue: "",
  financialAssets: "",
  loanDebt: "",
  rentalDepositHouseValue: "",
  rentalDepositAmount: "",
};

// ── Helpers ────────────────────────────────────────────────────
function toWon(manwon: string): number {
  const n = parseFloat(manwon);
  return isNaN(n) ? 0 : n * 10_000;
}

function fmtKRW(value: number): string {
  return Math.round(value).toLocaleString("ko-KR") + "원";
}

// ── Reusable Input ─────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  suffix = "만원",
  help,
  details,
  placeholder = "0",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  help?: string;
  details?: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3.5 pr-16 text-right text-base font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          {suffix}
        </span>
      </div>
      {help && (
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          {help}
        </p>
      )}
      {details && details.length > 0 && (
        <details className="mt-1">
          <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-500">
            자세히 보기
          </summary>
          <ul className="mt-1 space-y-0.5 text-xs leading-relaxed text-slate-400">
            {details.map((d, i) => (
              <li key={i}>· {d}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function PensionCalculator() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const update = useCallback(
    (field: keyof FormState, value: string | boolean) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setResult(null);
    },
    []
  );

  const calculate = useCallback(() => {
    const f = form;

    // ── 1. 월 소득평가액 ──────────────────────────
    // 근로소득 반영: 1인당 max(0, (근로소득 - 116만)) × 0.7
    const laborWon = toWon(f.laborIncome);
    const laborAfterDeduction = Math.max(0, laborWon - LABOR_INCOME_DEDUCTION);
    let laborIncomeReflected =
      laborAfterDeduction * (1 - LABOR_ADDITIONAL_DEDUCTION_RATE);

    // 부부가구: 배우자 근로소득도 별도로 116만원 공제
    if (f.household === "couple") {
      const spouseWon = toWon(f.laborIncomeSpouse);
      const spouseAfterDeduction = Math.max(0, spouseWon - LABOR_INCOME_DEDUCTION);
      laborIncomeReflected +=
        spouseAfterDeduction * (1 - LABOR_ADDITIONAL_DEDUCTION_RATE);
    }

    // 무료임차소득
    const freeRentWon = toWon(f.freeRentValue);
    const freeRentRatio = parseFloat(f.freeRentShareRatio) || 0;
    let freeRentIncomeCalc = 0;
    if (freeRentWon >= FREE_RENT_THRESHOLD && freeRentRatio > 0) {
      freeRentIncomeCalc =
        (freeRentWon * (freeRentRatio / 100) * FREE_RENT_ANNUAL_RATE) / 12;
    }

    // 기타소득 = 사업소득 + 재산소득 + 공적이전소득 + 무료임차소득
    const otherIncome =
      toWon(f.businessIncome) +
      toWon(f.assetIncome) +
      toWon(f.publicTransferIncome) +
      freeRentIncomeCalc;

    const monthlyIncomeEval = laborIncomeReflected + otherIncome;

    // ── 2. 재산의 월 소득환산액 ───────────────────
    // 일반재산 합계 (보정계수 적용)
    let generalProperty =
      toWon(f.buildingValue) +
      toWon(f.landValue) +
      toWon(f.depositValue) * DEPOSIT_FACTOR +
      toWon(f.otherPropertyValue) +
      toWon(f.aircraftShipValue) * AIRCRAFT_SHIP_FACTOR;

    // 자동차 처리
    const carWon = toWon(f.carValue);
    let pValue = toWon(f.membershipValue); // 회원권은 항상 P

    if (!f.carForBusiness && carWon > 0) {
      if (carWon >= LUXURY_CAR_THRESHOLD) {
        pValue += carWon; // 고급자동차 → P (월 100%)
      } else {
        generalProperty += carWon; // 일반자동차 → 일반재산
      }
    }

    // 금융재산 공제
    const financialAfterDeduction = Math.max(
      0,
      toWon(f.financialAssets) - FINANCIAL_DEDUCTION
    );

    // 부채 계산
    const loanWon = toWon(f.loanDebt);
    const rentalHouseWon = toWon(f.rentalDepositHouseValue);
    const rentalAmountWon = toWon(f.rentalDepositAmount);
    const rentalDebtRecognized = Math.min(
      rentalAmountWon,
      rentalHouseWon * 0.5
    );
    const totalDebt = loanWon + rentalDebtRecognized;

    // 순재산: 일반재산과 금융재산을 각각 별도 차감 후 합산 (복지로 공식)
    const generalAfterDeduction = Math.max(
      0,
      generalProperty - BASE_PROPERTY_DEDUCTION[f.region]
    );
    const netProperty = Math.max(
      0,
      generalAfterDeduction + financialAfterDeduction - totalDebt
    );

    // 재산의 월 소득환산액
    const propertyIncomeConversion = netProperty * INCOME_CONVERSION_RATE + pValue;

    // ── 3. 소득인정액 ─────────────────────────────
    const incomeRecognition = Math.round(
      monthlyIncomeEval + propertyIncomeConversion
    );

    // ── 4. 수급 여부 & 예상 수급액 ────────────────
    const threshold = THRESHOLDS[f.household];
    const isEligible = incomeRecognition <= threshold;

    let estimatedAmount = 0;
    if (isEligible) {
      estimatedAmount = BASE_PENSION;
      if (f.household === "couple") {
        estimatedAmount = Math.round(BASE_PENSION * COUPLE_REDUCTION);
      }
      // 소득역전방지 감액
      const gap = threshold - incomeRecognition;
      if (gap < estimatedAmount) {
        estimatedAmount = Math.max(0, gap);
      }
    }

    setResult({
      laborIncomeReflected: Math.round(laborIncomeReflected),
      otherIncome: Math.round(otherIncome),
      freeRentIncomeCalc: Math.round(freeRentIncomeCalc),
      monthlyIncomeEval: Math.round(monthlyIncomeEval),
      generalProperty: Math.round(generalProperty),
      financialAfterDeduction: Math.round(financialAfterDeduction),
      totalDebt: Math.round(totalDebt),
      netProperty: Math.round(netProperty),
      pValue: Math.round(pValue),
      propertyIncomeConversion: Math.round(propertyIncomeConversion),
      incomeRecognition,
      isEligible,
      estimatedAmount,
      threshold,
    });
  }, [form]);

  const reset = useCallback(() => {
    setForm(initialForm);
    setResult(null);
    setShowDetail(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* ── 헤더 & 안내 ─────────────────────────────── */}
      <div className="rounded-xl border border-slate-100 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              기초연금 모의계산기
            </h2>
            <p className="text-sm text-slate-400">
              2026년도 기초연금법 시행령·시행규칙 기준
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowIntro(!showIntro)}
          className="mt-3 flex w-full items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${showIntro ? "rotate-180" : ""}`}
          />
          안내사항 {showIntro ? "닫기" : "보기"}
        </button>

        {showIntro && (
          <div className="mt-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-500">
            <p>
              기초연금은 만 65세 이상 분들이 읍·면·동에 신청하시면 자산조사 후
              소득과 재산이 적으신 하위 70%의 어르신께 지급하게 됩니다.
            </p>
            <p>
              아래의 빈칸에 소득과 재산 내역을 입력하시면 소득인정액이
              자동계산되어 신청 전에 기초연금 수령여부를 자가진단하실 수
              있습니다.
            </p>
            <p className="text-slate-400">
              단, 본인이 알고 있는 사항과 실제 조사결과 확인된 자산내역의
              차이로 인해 모의계산 결과와 실제 연금신청시 결과가 다를 수
              있습니다.
            </p>
            <div className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-400">
              <p>
                * 본 기초연금 모의계산은 「기초연금 시행령·시행규칙」 및
                「기초연금법 고시」를 적용하였습니다. (2026년도 기준)
              </p>
              <p>
                * 기초연금 관련 문의는 보건복지부 상담센터(국번없이 129) 또는
                국민연금 상담센터(국번없이 1355)로 문의하여 주시기 바랍니다.
              </p>
              <p>
                * 직역연금(공무원·사립학교교직원·군인·별정우체국 연금)
                수급권자와 그 배우자는 대상에서 제외됩니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── 01 기본정보 + 02 소득정보 (2단 그리드) ──── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 01. 기본정보 */}
        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
              01
            </span>
            <h3 className="text-base font-semibold text-slate-800">
              기본정보
            </h3>
          </div>

          <div className="space-y-4">
            {/* 가구유형 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                가구 유형 <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => update("household", "single")}
                  className={`rounded-lg border px-3 py-3.5 text-center transition-all ${
                    form.household === "single"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-[15px] font-medium">단독가구</span>
                </button>
                <button
                  onClick={() => update("household", "couple")}
                  className={`rounded-lg border px-3 py-3.5 text-center transition-all ${
                    form.household === "couple"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-[15px] font-medium">부부가구</span>
                </button>
              </div>
              <details className="mt-1.5">
                <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-500">
                  산정 기준 보기
                </summary>
                <div className="mt-1 space-y-0.5 text-xs text-slate-400">
                  <p>· 소득인정액 = 월 소득평가액 + 재산의 월 소득환산액</p>
                  <p>
                    · 월 소득평가액 = {"{"}0.7 × (근로소득 - 116만원){"}"} +
                    기타소득
                  </p>
                  <p>
                    · 재산의 월 소득환산액 = [{"{"}(일반재산 - 기본재산) +
                    (금융재산 - 2,000만원) - 부채{"}"} × 4% / 12] + P
                  </p>
                  <p>
                    · P : 고급자동차(4,000만원 이상) 및 회원권의 가액
                  </p>
                  <p className="mt-1 font-medium text-slate-500">
                    · 선정기준액(&apos;26년): 단독가구{" "}
                    {THRESHOLDS.single.toLocaleString()}원, 부부가구{" "}
                    {THRESHOLDS.couple.toLocaleString()}원
                  </p>
                </div>
              </details>
            </div>

            {/* 거주지 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                거주지 <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "metro", label: "대도시", sub: "특별·광역시" },
                    { value: "city", label: "중소도시", sub: "도의 시" },
                    { value: "rural", label: "농어촌", sub: "도의 군" },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.value}
                    onClick={() => update("region", r.value)}
                    className={`rounded-lg border px-2 py-3.5 text-center transition-all ${
                      form.region === r.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-sm font-medium">
                      {r.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-xs ${
                        form.region === r.value
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {r.sub}
                    </span>
                  </button>
                ))}
              </div>
              <details className="mt-1.5">
                <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-500">
                  기본공제 재산액 보기
                </summary>
                <div className="mt-1 text-xs text-slate-400">
                  <p>· 대도시 1억 3,500만원, 중소도시 8,500만원, 농어촌 7,250만원</p>
                  <p>
                    · 대도시: 특별시, 광역시의 &quot;구&quot;(도농복합군 포함), 특례시
                  </p>
                  <p>
                    · 중소도시: 도의 &quot;시&quot;와 세종특별자치시
                  </p>
                  <p>· 농어촌: 도의 &quot;군&quot;</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* 02. 소득정보 */}
        <div className="rounded-xl border border-slate-100 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
              02
            </span>
            <h3 className="text-base font-semibold text-slate-800">
              소득정보
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                근로소득
              </label>
              {form.household === "couple" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={form.laborIncome}
                        onChange={(e) => update("laborIncome", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3.5 pr-16 text-right text-base font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        만원/월
                      </span>
                    </div>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      본인
                    </span>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={form.laborIncomeSpouse}
                        onChange={(e) => update("laborIncomeSpouse", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3.5 pr-16 text-right text-base font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        만원/월
                      </span>
                    </div>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      배우자
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={form.laborIncome}
                    onChange={(e) => update("laborIncome", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3.5 pr-16 text-right text-base font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    만원/월
                  </span>
                </div>
              )}
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                상시근로소득 및 일용근로소득 (공공일자리 소득 제외)
              </p>
              <details className="mt-1">
                <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-500">
                  자세히 보기
                </summary>
                <ul className="mt-1 space-y-0.5 text-xs leading-relaxed text-slate-400">
                  <li>· 상시근로소득: 3개월 이상 계속 고용되어 월정액 급여를 지급 받는 자의 근로소득</li>
                  <li>· 일용근로소득: 3개월 미만 (건설공사·하역작업 종사자 제외)</li>
                  <li>· 공공일자리 소득(노인일자리사업, 자활근로, 공공근로 등)은 제외</li>
                  <li>· 반영액 = 1인당 (근로소득 - 116만원) × 0.7</li>
                </ul>
              </details>
            </div>

            <Field
              label="사업소득"
              value={form.businessIncome}
              onChange={(v) => update("businessIncome", v)}
              suffix="만원/월"
              help="농업·임업·어업 소득, 임대소득, 기타사업소득"
              details={[
                "농업·임업·어업 소득",
                "임대 소득",
                "기타사업소득: 도매업·소매업, 제조업, 기타 사업에서 얻는 소득",
              ]}
            />

            <div className="grid grid-cols-2 gap-2">
              <Field
                label="재산소득"
                value={form.assetIncome}
                onChange={(v) => update("assetIncome", v)}
                suffix="만원/월"
                help="이자소득, 연금소득의 합"
              />

              <Field
                label="공적이전소득"
                value={form.publicTransferIncome}
                onChange={(v) => update("publicTransferIncome", v)}
                suffix="만원/월"
                help="국민연금, 산재급여 등"
              />
            </div>

            {/* 무료임차소득 */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">
                무료임차소득
              </label>
              <p className="mb-2 text-xs text-slate-400">
                자녀소유 주택에 거주 시 시가표준액 입력 (6억 이상만 해당)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={form.freeRentShareRatio}
                    onChange={(e) =>
                      update("freeRentShareRatio", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3.5 pr-8 text-right text-base font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    %
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    지분율
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={form.freeRentValue}
                    onChange={(e) => update("freeRentValue", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3.5 pr-12 text-right text-base font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    만원
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    시가표준액
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 03. 재산정보 (전체 너비, 내부 2단) ─────── */}
      <div className="rounded-xl border border-slate-100 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
            03
          </span>
          <h3 className="text-base font-semibold text-slate-800">
            재산정보
          </h3>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 좌측: 일반재산 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-slate-400">
              일반재산
            </h4>

            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <Field
                label="건축물"
                value={form.buildingValue}
                onChange={(v) => update("buildingValue", v)}
                help="주택, 건물, 시설물 시가표준액"
              />
              <Field
                label="토지"
                value={form.landValue}
                onChange={(v) => update("landValue", v)}
                help="시가표준액"
              />
              <Field
                label="임차보증금"
                value={form.depositValue}
                onChange={(v) => update("depositValue", v)}
                help="전월세·상가·기타보증금"
              />
              <Field
                label="기타재산"
                value={form.otherPropertyValue}
                onChange={(v) => update("otherPropertyValue", v)}
                help="증여재산, 입주권, 분양권 등"
              />
              <Field
                label="항공기/선박"
                value={form.aircraftShipValue}
                onChange={(v) => update("aircraftShipValue", v)}
              />
              <Field
                label="회원권"
                value={form.membershipValue}
                onChange={(v) => update("membershipValue", v)}
                help="골프장, 콘도 등 시가표준액"
              />
            </div>

            {/* 자동차 */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="mb-3 text-sm font-semibold tracking-wide text-slate-400">
                자동차
              </h4>

              <label className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.carForBusiness}
                  onChange={(e) => update("carForBusiness", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                />
                <span className="text-sm font-medium text-slate-600">
                  생업용 자동차
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="배기량"
                  value={form.carCC}
                  onChange={(v) => update("carCC", v)}
                  suffix="cc"
                  placeholder="0"
                />
                <Field
                  label="가액"
                  value={form.carValue}
                  onChange={(v) => update("carValue", v)}
                />
              </div>

              <details className="mt-1.5">
                <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-500">
                  자동차 산정 기준 보기
                </summary>
                <div className="mt-1 space-y-0.5 text-xs text-slate-400">
                  <p>· 생업용 자동차: 재산산정 제외 (1대 한정)</p>
                  <p>
                    · 4,000만원 이상 고급자동차: 월 소득환산율 100% 적용 (P값)
                  </p>
                  <p>
                    · 그 외 자동차: 연 4% 소득환산율 적용 (일반재산)
                  </p>
                </div>
              </details>
            </div>
          </div>

          {/* 우측: 금융재산 + 부채 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-slate-400">
              금융재산
            </h4>
            <Field
              label="금융재산"
              value={form.financialAssets}
              onChange={(v) => update("financialAssets", v)}
              help="예금, 적금, 주식, 보험 등 (2,000만원 공제)"
              details={[
                "실제 자산조사 시 금융기관으로부터 금융정보 등 조회결과를 적용",
                "3개월 이내 평균잔액, 최종시세가액, 액면가액 등 반영",
              ]}
            />

            <div className="border-t border-slate-100 pt-4">
              <h4 className="mb-3 text-sm font-semibold tracking-wide text-slate-400">
                부채
              </h4>

              <div className="space-y-4">
                <Field
                  label="대출금"
                  value={form.loanDebt}
                  onChange={(v) => update("loanDebt", v)}
                  help="금융기관 대출금"
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">
                    임대보증금
                  </label>
                  <p className="mb-2 text-xs text-slate-400">
                    주택 등 시가표준액의 50% 범위 내에서 인정
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          value={form.rentalDepositHouseValue}
                          onChange={(e) =>
                            update("rentalDepositHouseValue", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3.5 pr-12 text-right text-base font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          만원
                        </span>
                      </div>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        주택 등 시가표준액
                      </span>
                    </div>
                    <div>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          value={form.rentalDepositAmount}
                          onChange={(e) =>
                            update("rentalDepositAmount", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3.5 pr-12 text-right text-base font-medium text-slate-900 transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          만원
                        </span>
                      </div>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        임대보증금
                      </span>
                    </div>
                  </div>
                  <details className="mt-1.5">
                    <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-500">
                      자세히 보기
                    </summary>
                    <div className="mt-1 text-xs text-slate-400">
                      <p>
                        · 전세권 설정 또는 확정일자가 있는 임대보증금 중 주택 등
                        시가표준액의 50% 범위 내에서 인정
                      </p>
                      <p>
                        · 주택, 상가 등을 보유한 경우 한 채에 한해 인정
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 계산/초기화 버튼 ─────────────────────────── */}
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-5 py-3 text-[15px] font-medium text-slate-500 transition-colors hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          초기화
        </button>
        <button
          onClick={calculate}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <Calculator className="h-4 w-4" />
          계산하기
        </button>
      </div>

      {/* ── 결과 ─────────────────────────────────────── */}
      {result && (
        <div className="space-y-3">
          {/* 주요 결과 */}
          <div
            className={`rounded-xl p-6 text-center ${
              result.isEligible ? "bg-emerald-50" : "bg-slate-50"
            }`}
          >
            <div
              className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                result.isEligible ? "bg-emerald-100" : "bg-slate-200"
              }`}
            >
              {result.isEligible ? (
                <Check className="h-7 w-7 text-emerald-600" />
              ) : (
                <span className="text-2xl text-slate-400">-</span>
              )}
            </div>
            <h3
              className={`text-lg font-bold ${
                result.isEligible ? "text-emerald-800" : "text-slate-500"
              }`}
            >
              {result.isEligible
                ? "수급 가능성이 높습니다"
                : "수급이 어려울 수 있습니다"}
            </h3>
            {result.isEligible && result.estimatedAmount > 0 && (
              <p className="mt-2 text-3xl font-bold text-slate-900">
                월 {result.estimatedAmount.toLocaleString()}원
              </p>
            )}
            <div className="mt-3 inline-flex items-center gap-4 text-[15px]">
              <span className="text-slate-400">
                소득인정액{" "}
                <strong className="text-slate-700">
                  {fmtKRW(result.incomeRecognition)}
                </strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">
                선정기준액{" "}
                <strong className="text-slate-700">
                  {fmtKRW(result.threshold)}
                </strong>
              </span>
            </div>
          </div>

          {/* 상세 내역 토글 */}
          <div className="rounded-xl border border-slate-100 bg-white">
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-[15px] font-semibold text-slate-700"
            >
              상세 산정 내역
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${showDetail ? "rotate-180" : ""}`}
              />
            </button>

            {showDetail && (
              <div className="border-t border-slate-100 px-5 py-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* 소득평가액 */}
                  <div>
                    <h5 className="mb-2 text-[15px] font-semibold uppercase tracking-wider text-slate-400">
                      월 소득평가액
                    </h5>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">근로소득 반영액</span>
                        <span className="font-medium text-slate-700">
                          {fmtKRW(result.laborIncomeReflected)}
                        </span>
                      </div>
                      {result.freeRentIncomeCalc > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">
                            무료임차소득
                          </span>
                          <span className="font-medium text-slate-700">
                            {fmtKRW(result.freeRentIncomeCalc)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">기타소득 합계</span>
                        <span className="font-medium text-slate-700">
                          {fmtKRW(result.otherIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-1.5 text-sm">
                        <span className="font-medium text-slate-600">
                          소득평가액 합계
                        </span>
                        <span className="font-semibold text-slate-900">
                          {fmtKRW(result.monthlyIncomeEval)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 재산 소득환산액 */}
                  <div>
                    <h5 className="mb-2 text-[15px] font-semibold uppercase tracking-wider text-slate-400">
                      재산의 월 소득환산액
                    </h5>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">일반재산 합계</span>
                        <span className="font-medium text-slate-700">
                          {fmtKRW(result.generalProperty)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          기본재산 공제
                        </span>
                        <span className="font-medium text-slate-700">
                          -{fmtKRW(BASE_PROPERTY_DEDUCTION[form.region])}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          금융재산 (공제 후)
                        </span>
                        <span className="font-medium text-slate-700">
                          {fmtKRW(result.financialAfterDeduction)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">부채 합계</span>
                        <span className="font-medium text-slate-700">
                          -{fmtKRW(result.totalDebt)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">순재산</span>
                        <span className="font-medium text-slate-700">
                          {fmtKRW(result.netProperty)}
                        </span>
                      </div>
                      {result.pValue > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">
                            P값 (고급차+회원권)
                          </span>
                          <span className="font-medium text-slate-700">
                            {fmtKRW(result.pValue)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-100 pt-1.5 text-sm">
                        <span className="font-medium text-slate-600">
                          재산 소득환산액 합계
                        </span>
                        <span className="font-semibold text-slate-900">
                          {fmtKRW(result.propertyIncomeConversion)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 최종 */}
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <div className="flex justify-between text-[15px]">
                    <span className="font-semibold text-slate-700">
                      소득인정액
                    </span>
                    <span className="font-bold text-slate-900">
                      {fmtKRW(result.incomeRecognition)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    = 소득평가액 + 재산 소득환산액
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 안내 */}
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[15px] leading-relaxed text-slate-500">
              본 계산 결과는 참고용이며, 실제 수급 여부는 국민연금공단의
              심사를 통해 결정됩니다. 정확한 확인은{" "}
              <strong className="text-slate-600">
                보건복지부(129) 또는 국민연금공단(1355)
              </strong>
              에 문의하세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
