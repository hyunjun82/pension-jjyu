import Link from "next/link";
import { Shield } from "lucide-react";

const categories = [
  { name: "수급자격", href: "/수급자격" },
  { name: "신청방법", href: "/신청방법" },
  { name: "지급금액", href: "/지급금액" },
  { name: "소득인정액", href: "/소득인정액" },
  { name: "자주 묻는 질문", href: "/자주묻는질문" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-gray-900">기초연금</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
