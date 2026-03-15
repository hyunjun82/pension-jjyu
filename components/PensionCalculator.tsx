"use client";

import { useState, useCallback } from "react";
import { Calculator, RotateCcw, Check, ChevronDown, X } from "lucide-react";

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

/** 만원 단위 숫자를 한글로: "15000" → "1억 5천만원" */
function fmtManwonKR(val: string): string {
  const n = parseInt(val);
  if (!n || isNaN(n)) return "";
  const eok = Math.floor(n / 10000);
  const cheon = Math.floor((n % 10000) / 1000);
  const baek = Math.floor((n % 1000) / 100);
  const sip = Math.floor((n % 100) / 10);
  const il = n % 10;
  let s = "";
  if (eok > 0) s += `${eok}억 `;
  if (cheon > 0) s += `${cheon}천`;
  if (baek > 0) s += `${baek}백`;
  if (sip > 0) s += `${sip}십`;
  if (il > 0 && (eok > 0 || cheon > 0 || baek > 0 || sip > 0)) s += `${il}`;
  else if (il > 0) s += `${il}`;
  s = s.trim();
  if (s) s += "만원";
  return s;
}

// ── Reusable Input ─────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  suffix = "만원",
  help,
  placeholder = "0",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  help?: string;
  placeholder?: string;
}) {
  const koreanUnit = suffix.includes("만원") ? fmtManwonKR(value) : "";
  return (
    <div>
      <label className="mb-1.5 block text-[15px] font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-4 pr-20 text-right text-lg font-bold text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-medium text-slate-600">
          {suffix}
        </span>
      </div>
      {koreanUnit && (
        <p className="mt-1 text-sm font-semibold text-blue-600">
          → {koreanUnit}
        </p>
      )}
      {help && (
        <p className="mt-1 text-sm text-slate-600">{help}</p>
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
  const [showMore, setShowMore] = useState(false);

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
    const laborWon = toWon(f.laborIncome);
    const laborAfterDeduction = Math.max(0, laborWon - LABOR_INCOME_DEDUCTION);
    let laborIncomeReflected =
      laborAfterDeduction * (1 - LABOR_ADDITIONAL_DEDUCTION_RATE);

    if (f.household === "couple") {
      const spouseWon = toWon(f.laborIncomeSpouse);
      const spouseAfterDeduction = Math.max(0, spouseWon - LABOR_INCOME_DEDUCTION);
      laborIncomeReflected +=
        spouseAfterDeduction * (1 - LABOR_ADDITIONAL_DEDUCTION_RATE);
    }

    const freeRentWon = toWon(f.freeRentValue);
    const freeRentRatio = parseFloat(f.freeRentShareRatio) || 0;
    let freeRentIncomeCalc = 0;
    if (freeRentWon >= FREE_RENT_THRESHOLD && freeRentRatio > 0) {
      freeRentIncomeCalc =
        (freeRentWon * (freeRentRatio / 100) * FREE_RENT_ANNUAL_RATE) / 12;
    }

    const otherIncome =
      toWon(f.businessIncome) +
      toWon(f.assetIncome) +
      toWon(f.publicTransferIncome) +
      freeRentIncomeCalc;

    const monthlyIncomeEval = laborIncomeReflected + otherIncome;

    // ── 2. 재산의 월 소득환산액 ───────────────────
    let generalProperty =
      toWon(f.buildingValue) +
      toWon(f.landValue) +
      toWon(f.depositValue) * DEPOSIT_FACTOR +
      toWon(f.otherPropertyValue) +
      toWon(f.aircraftShipValue) * AIRCRAFT_SHIP_FACTOR;

    const carWon = toWon(f.carValue);
    let pValue = toWon(f.membershipValue);

    if (!f.carForBusiness && carWon > 0) {
      if (carWon >= LUXURY_CAR_THRESHOLD) {
        pValue += carWon;
      } else {
        generalProperty += carWon;
      }
    }

    const financialAfterDeduction = Math.max(
      0,
      toWon(f.financialAssets) - FINANCIAL_DEDUCTION
    );

    const loanWon = toWon(f.loanDebt);
    const rentalHouseWon = toWon(f.rentalDepositHouseValue);
    const rentalAmountWon = toWon(f.rentalDepositAmount);
    const rentalDebtRecognized = Math.min(
      rentalAmountWon,
      rentalHouseWon * 0.5
    );
    const totalDebt = loanWon + rentalDebtRecognized;

    const generalAfterDeduction = Math.max(
      0,
      generalProperty - BASE_PROPERTY_DEDUCTION[f.region]
    );
    const netProperty = Math.max(
      0,
      generalAfterDeduction + financialAfterDeduction - totalDebt
    );

    const propertyIncomeConversion = netProperty * INCOME_CONVERSION_RATE + pValue;

    const incomeRecognition = Math.round(
      monthlyIncomeEval + propertyIncomeConversion
    );

    const threshold = THRESHOLDS[f.household];
    const isEligible = incomeRecognition <= threshold;

    let estimatedAmount = 0;
    if (isEligible) {
      estimatedAmount = BASE_PENSION;
      if (f.household === "couple") {
        estimatedAmount = Math.round(BASE_PENSION * COUPLE_REDUCTION);
      }
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

  const threshold = THRESHOLDS[form.household];

  return (
    <div className="space-y-5">
      {/* ── 헤더 ─────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              기초연금 모의계산기
            </h2>
            <p className="text-sm text-slate-600">
              2026년도 기초연금법 시행령·시행규칙 기준
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowIntro(!showIntro)}
          className="mt-3 flex w-full items-center gap-1.5 text-[15px] font-medium text-slate-600 hover:text-slate-800"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showIntro ? "rotate-180" : ""}`}
          />
          안내사항 {showIntro ? "닫기" : "보기"}
        </button>

        {showIntro && (
          <div className="mt-3 rounded-xl bg-blue-50 p-5 text-[15px] leading-relaxed text-slate-700">
            <p className="font-semibold text-blue-800">
              만 65세 이상이시면 기초연금을 신청할 수 있어요.
            </p>
            <p className="mt-2">
              아래에 소득과 재산을 입력하시면 기초연금을 받으실 수 있는지
              미리 확인해 볼 수 있어요.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              * 실제 수급 여부는 주민센터 신청 후 정확히 판정됩니다.
            </p>
          </div>
        )}
      </div>

      {/* ── 01 기본정보 + 02 소득정보 ──── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* 01. 기본정보 */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              01
            </span>
            <h3 className="text-lg font-bold text-slate-900">기본정보</h3>
          </div>

          <div className="space-y-5">
            {/* 가구유형 */}
            <div>
              <label className="mb-2 block text-[15px] font-semibold text-slate-800">
                가구 유형 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { v: "single" as const, label: "단독가구", desc: "혼자 사시는 경우" },
                  { v: "couple" as const, label: "부부가구", desc: "배우자와 함께" },
                ]).map((h) => (
                  <button
                    key={h.v}
                    onClick={() => update("household", h.v)}
                    className={`rounded-xl border-2 px-4 py-4 text-center transition-all ${
                      form.household === h.v
                        ? "border-blue-600 bg-blue-600 text-white shadow-md"
                        : "border-slate-200 text-slate-800 hover:border-slate-400"
                    }`}
                  >
                    <span className="block text-lg font-bold">{h.label}</span>
                    <span className={`mt-0.5 block text-sm ${form.household === h.v ? "text-blue-100" : "text-slate-500"}`}>
                      {h.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 거주지 */}
            <div>
              <label className="mb-2 block text-[15px] font-semibold text-slate-800">
                거주지 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: "metro" as const, label: "대도시", sub: "특별·광역시" },
                  { value: "city" as const, label: "중소도시", sub: "도의 시" },
                  { value: "rural" as const, label: "농어촌", sub: "도의 군" },
                ]).map((r) => (
                  <button
                    key={r.value}
                    onClick={() => update("region", r.value)}
                    className={`rounded-xl border-2 px-2 py-4 text-center transition-all ${
                      form.region === r.value
                        ? "border-blue-600 bg-blue-600 text-white shadow-md"
                        : "border-slate-200 text-slate-800 hover:border-slate-400"
                    }`}
                  >
                    <span className="block text-base font-bold">{r.label}</span>
                    <span className={`mt-0.5 block text-sm ${form.region === r.value ? "text-blue-100" : "text-slate-500"}`}>
                      {r.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 기준선 안내 */}
            <div className="rounded-xl bg-amber-50 px-4 py-3">
              <p className="text-[15px] font-semibold text-amber-800">
                기준선: 월 {threshold.toLocaleString()}원 이하면 받을 수 있어요
              </p>
              <p className="mt-0.5 text-sm text-amber-700">
                {form.household === "single" ? "단독가구" : "부부가구"} · {form.region === "metro" ? "대도시" : form.region === "city" ? "중소도시" : "농어촌"} 기준
              </p>
            </div>
          </div>
        </div>

        {/* 02. 소득정보 */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              02
            </span>
            <h3 className="text-lg font-bold text-slate-900">매달 버는 돈</h3>
          </div>

          <div className="space-y-5">
            {/* 근로소득 */}
            <div>
              <label className="mb-1.5 block text-[15px] font-semibold text-slate-800">
                근로소득 (일해서 버는 돈)
              </label>
              {form.household === "couple" ? (
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { field: "laborIncome" as const, label: "본인", val: form.laborIncome },
                    { field: "laborIncomeSpouse" as const, label: "배우자", val: form.laborIncomeSpouse },
                  ]).map((item) => (
                    <div key={item.field}>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          value={item.val}
                          onChange={(e) => update(item.field, e.target.value)}
                          className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-4 pr-20 text-right text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-medium text-slate-600">
                          만원/월
                        </span>
                      </div>
                      <span className="mt-0.5 block text-sm font-medium text-slate-600">{item.label}</span>
                      {fmtManwonKR(item.val) && (
                        <p className="text-sm font-semibold text-blue-600">→ {fmtManwonKR(item.val)}/월</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="0"
                      value={form.laborIncome}
                      onChange={(e) => update("laborIncome", e.target.value)}
                      className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-4 pr-20 text-right text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-medium text-slate-600">
                      만원/월
                    </span>
                  </div>
                  {fmtManwonKR(form.laborIncome) && (
                    <p className="mt-1 text-sm font-semibold text-blue-600">→ {fmtManwonKR(form.laborIncome)}/월</p>
                  )}
                </>
              )}
              <p className="mt-1 text-sm text-slate-500">
                월급, 일당 등 (노인일자리·공공근로 소득은 빼고 입력)
              </p>
            </div>

            <Field
              label="사업소득 (장사해서 버는 돈)"
              value={form.businessIncome}
              onChange={(v) => update("businessIncome", v)}
              suffix="만원/월"
              help="농사·가게·임대 등에서 매달 버는 돈"
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="이자·연금소득"
                value={form.assetIncome}
                onChange={(v) => update("assetIncome", v)}
                suffix="만원/월"
                help="은행이자, 개인연금 등"
              />
              <Field
                label="국민연금 등"
                value={form.publicTransferIncome}
                onChange={(v) => update("publicTransferIncome", v)}
                suffix="만원/월"
                help="국민연금, 산재급여 등"
              />
            </div>

            {/* 무료임차소득 - 숨김 가능 */}
            <details>
              <summary className="cursor-pointer text-[15px] font-medium text-blue-600 hover:text-blue-800">
                자녀 소유 주택에 거주하고 계신가요?
              </summary>
              <div className="mt-3 rounded-xl bg-slate-50 p-4 space-y-3">
                <p className="text-sm text-slate-600">6억원 이상 주택만 해당돼요</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="자녀 지분율"
                    value={form.freeRentShareRatio}
                    onChange={(v) => update("freeRentShareRatio", v)}
                    suffix="%"
                  />
                  <Field
                    label="주택 시가표준액"
                    value={form.freeRentValue}
                    onChange={(v) => update("freeRentValue", v)}
                  />
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* ── 03. 재산정보 ─────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            03
          </span>
          <h3 className="text-lg font-bold text-slate-900">가지고 있는 재산</h3>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 좌측: 부동산 + 자동차 */}
          <div className="space-y-5">
            <h4 className="text-base font-bold text-slate-800">부동산</h4>

            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              <Field
                label="건물·주택"
                value={form.buildingValue}
                onChange={(v) => update("buildingValue", v)}
                help="시가표준액 기준"
              />
              <Field
                label="토지·땅"
                value={form.landValue}
                onChange={(v) => update("landValue", v)}
                help="시가표준액 기준"
              />
              <Field
                label="전세보증금"
                value={form.depositValue}
                onChange={(v) => update("depositValue", v)}
                help="전월세·상가 보증금"
              />
              <Field
                label="기타재산"
                value={form.otherPropertyValue}
                onChange={(v) => update("otherPropertyValue", v)}
                help="분양권, 입주권 등"
              />
            </div>

            {/* 자동차 */}
            <div className="border-t-2 border-slate-100 pt-5">
              <h4 className="mb-3 text-base font-bold text-slate-800">자동차</h4>

              <label className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.carForBusiness}
                  onChange={(e) => update("carForBusiness", e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 accent-blue-600"
                />
                <span className="text-[15px] font-medium text-slate-700">
                  생업용 자동차 (장사에 쓰는 차)
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="배기량"
                  value={form.carCC}
                  onChange={(v) => update("carCC", v)}
                  suffix="cc"
                />
                <Field
                  label="차량 가격"
                  value={form.carValue}
                  onChange={(v) => update("carValue", v)}
                />
              </div>
            </div>

            {/* 더 입력하기 (항공기, 회원권) */}
            {!showMore ? (
              <button
                onClick={() => setShowMore(true)}
                className="text-[15px] font-medium text-blue-600 hover:text-blue-800"
              >
                + 항공기·선박·회원권 입력하기
              </button>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">추가 재산</span>
                  <button onClick={() => setShowMore(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="항공기/선박"
                    value={form.aircraftShipValue}
                    onChange={(v) => update("aircraftShipValue", v)}
                  />
                  <Field
                    label="회원권"
                    value={form.membershipValue}
                    onChange={(v) => update("membershipValue", v)}
                    help="골프장, 콘도 등"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 우측: 금융재산 + 빚 */}
          <div className="space-y-5">
            <h4 className="text-base font-bold text-slate-800">저축·금융</h4>
            <Field
              label="금융재산 (저축, 주식 등)"
              value={form.financialAssets}
              onChange={(v) => update("financialAssets", v)}
              help="예금·적금·주식·보험 등 합계 (2천만원 공제)"
            />

            <div className="border-t-2 border-slate-100 pt-5">
              <h4 className="mb-3 text-base font-bold text-slate-800">빚 (부채)</h4>

              <div className="space-y-5">
                <Field
                  label="은행 대출금"
                  value={form.loanDebt}
                  onChange={(v) => update("loanDebt", v)}
                  help="금융기관 대출금"
                />

                <details>
                  <summary className="cursor-pointer text-[15px] font-medium text-blue-600 hover:text-blue-800">
                    세입자에게 받은 보증금이 있나요?
                  </summary>
                  <div className="mt-3 rounded-xl bg-slate-50 p-4 space-y-3">
                    <p className="text-sm text-slate-600">시가표준액의 50% 범위에서 빚으로 인정돼요</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Field
                          label="주택 시가표준액"
                          value={form.rentalDepositHouseValue}
                          onChange={(v) => update("rentalDepositHouseValue", v)}
                        />
                      </div>
                      <div>
                        <Field
                          label="임대보증금"
                          value={form.rentalDepositAmount}
                          onChange={(v) => update("rentalDepositAmount", v)}
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 계산/초기화 버튼 ─────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 px-6 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          초기화
        </button>
        <button
          onClick={calculate}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700"
        >
          <Calculator className="h-5 w-5" />
          계산하기
        </button>
      </div>

      {/* ── 결과 ─────────────────────────────────────── */}
      {result && (
        <div className="space-y-4">
          {/* 주요 결과 */}
          <div
            className={`rounded-2xl p-8 text-center ${
              result.isEligible
                ? "bg-gradient-to-b from-emerald-50 to-emerald-100 border-2 border-emerald-200"
                : "bg-gradient-to-b from-slate-50 to-slate-100 border-2 border-slate-200"
            }`}
          >
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                result.isEligible ? "bg-emerald-200" : "bg-slate-200"
              }`}
            >
              {result.isEligible ? (
                <Check className="h-8 w-8 text-emerald-700" />
              ) : (
                <X className="h-8 w-8 text-slate-500" />
              )}
            </div>

            <h3 className={`text-xl font-bold ${result.isEligible ? "text-emerald-800" : "text-slate-700"}`}>
              {result.isEligible
                ? "기초연금 받으실 수 있어요!"
                : "기준을 초과했어요"}
            </h3>

            {result.isEligible && result.estimatedAmount > 0 && (
              <div className="mt-3">
                <p className="text-base text-emerald-700">매달 약</p>
                <p className="text-4xl font-black text-slate-900">
                  {result.estimatedAmount.toLocaleString()}원
                </p>
                <p className="mt-1 text-base text-emerald-700">
                  통장으로 들어와요
                </p>
              </div>
            )}

            {!result.isEligible && (
              <p className="mt-2 text-base text-slate-600">
                소득인정액이 기준선({fmtKRW(result.threshold)})보다{" "}
                <strong className="text-red-600">{fmtKRW(result.incomeRecognition - result.threshold)}</strong> 많아요
              </p>
            )}

            {/* 게이지 바 */}
            <div className="mt-6 mx-auto max-w-sm">
              <div className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                <span>0원</span>
                <span>기준선 {(result.threshold / 10000).toFixed(0)}만원</span>
              </div>
              <div className="h-6 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    result.isEligible ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(100, (result.incomeRecognition / result.threshold) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-[15px] font-bold text-slate-800">
                내 소득인정액: {fmtKRW(result.incomeRecognition)}
                <span className="ml-1 text-sm font-normal text-slate-500">
                  (기준의 {Math.round((result.incomeRecognition / result.threshold) * 100)}%)
                </span>
              </p>
            </div>

            {result.isEligible && (
              <div className="mt-5 rounded-xl bg-white/70 px-5 py-3 text-left">
                <p className="text-[15px] font-semibold text-emerald-800">
                  신청하는 곳
                </p>
                <p className="mt-1 text-base text-slate-700">
                  가까운 <strong>읍·면·동 주민센터</strong> 또는{" "}
                  <strong>국민연금공단 지사</strong>에서 신청하세요.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  문의: 보건복지부 129 / 국민연금공단 1355
                </p>
              </div>
            )}
          </div>

          {/* 상세 내역 토글 */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white">
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="flex w-full items-center justify-between px-6 py-4 text-base font-bold text-slate-800"
            >
              상세 계산 내역 보기
              <ChevronDown
                className={`h-5 w-5 text-slate-500 transition-transform ${showDetail ? "rotate-180" : ""}`}
              />
            </button>

            {showDetail && (
              <div className="border-t-2 border-slate-100 px-6 py-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  {/* 소득 */}
                  <div>
                    <h5 className="mb-3 text-base font-bold text-slate-800">
                      매달 버는 돈 (소득평가액)
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[15px]">
                        <span className="text-slate-600">근로소득 반영액</span>
                        <span className="font-semibold">{fmtKRW(result.laborIncomeReflected)}</span>
                      </div>
                      {result.freeRentIncomeCalc > 0 && (
                        <div className="flex justify-between text-[15px]">
                          <span className="text-slate-600">무료임차소득</span>
                          <span className="font-semibold">{fmtKRW(result.freeRentIncomeCalc)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[15px]">
                        <span className="text-slate-600">기타소득 합계</span>
                        <span className="font-semibold">{fmtKRW(result.otherIncome)}</span>
                      </div>
                      <div className="flex justify-between border-t-2 border-slate-100 pt-2 text-[15px]">
                        <span className="font-bold text-slate-800">소득 합계</span>
                        <span className="font-bold text-blue-700">{fmtKRW(result.monthlyIncomeEval)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 재산 */}
                  <div>
                    <h5 className="mb-3 text-base font-bold text-slate-800">
                      재산을 소득으로 바꾼 금액
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[15px]">
                        <span className="text-slate-600">일반재산</span>
                        <span className="font-semibold">{fmtKRW(result.generalProperty)}</span>
                      </div>
                      <div className="flex justify-between text-[15px]">
                        <span className="text-slate-600">기본재산 공제</span>
                        <span className="font-semibold">-{fmtKRW(BASE_PROPERTY_DEDUCTION[form.region])}</span>
                      </div>
                      <div className="flex justify-between text-[15px]">
                        <span className="text-slate-600">금융재산 (공제 후)</span>
                        <span className="font-semibold">{fmtKRW(result.financialAfterDeduction)}</span>
                      </div>
                      <div className="flex justify-between text-[15px]">
                        <span className="text-slate-600">빚 합계</span>
                        <span className="font-semibold">-{fmtKRW(result.totalDebt)}</span>
                      </div>
                      {result.pValue > 0 && (
                        <div className="flex justify-between text-[15px]">
                          <span className="text-slate-600">고급차·회원권</span>
                          <span className="font-semibold">{fmtKRW(result.pValue)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t-2 border-slate-100 pt-2 text-[15px]">
                        <span className="font-bold text-slate-800">재산 소득환산</span>
                        <span className="font-bold text-blue-700">{fmtKRW(result.propertyIncomeConversion)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-blue-50 p-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-slate-800">나라에서 보는 내 소득</span>
                    <span className="font-black text-blue-700">{fmtKRW(result.incomeRecognition)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    = 매달 버는 돈 + 재산을 소득으로 바꾼 금액
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
