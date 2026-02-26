import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            기초연금 정보는 일반적인 안내 목적이며, 정확한 수급 여부는 국민연금공단에 문의하세요.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-600">
              홈
            </Link>
            <span>|</span>
            <Link href="/about" className="hover:text-gray-600">
              안내
            </Link>
            <span>|</span>
            <span>복지로 공공데이터 활용</span>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs leading-relaxed text-amber-800">
            <strong>면책조항:</strong> 본 사이트에서 제공하는 기초연금 정보는
            보건복지부 및 국민연금공단의 공식 자료를 참고하여 작성되었으며,
            일반적인 정보 제공 목적입니다. 실제 수급 자격 및 금액은 개인의 소득·재산
            상황에 따라 달라질 수 있으므로, 정확한 확인은{" "}
            <strong>국민연금공단(1355) 또는 주민센터</strong>에 문의하시기
            바랍니다.
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} 기초연금 정보. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
