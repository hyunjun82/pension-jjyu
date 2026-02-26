import Link from "next/link";

const categories = [
  { name: "수급자격", href: "/수급자격" },
  { name: "신청방법", href: "/신청방법" },
  { name: "지급금액", href: "/지급금액" },
  { name: "소득인정액", href: "/소득인정액" },
  { name: "자주 묻는 질문", href: "/자주묻는질문" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <span className="text-sm font-bold text-white">연</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            기초연금
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="rounded-md px-3 py-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
