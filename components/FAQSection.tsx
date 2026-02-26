"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection({ items }: { items: FAQItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <HelpCircle className="h-4 w-4 text-slate-400" />
        <h2 className="text-[14px] font-semibold text-slate-800">
          자주 묻는 질문
        </h2>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item, idx) => (
          <div key={idx}>
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <span className="text-[13px] font-medium leading-snug text-slate-700">
                Q. {item.question}
              </span>
              <ChevronDown
                className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                  openIdx === idx ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                openIdx === idx ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="px-5 pb-4">
                <p className="rounded-lg bg-slate-50 px-4 py-3 text-[13px] leading-relaxed text-slate-500">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
