import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@/data/categories";

export function CategoryCard({
  category,
  count,
}: {
  category: Category;
  count?: number;
}) {
  return (
    <Link href={`/${category.slug}`}>
      <Card className="h-full cursor-pointer border-gray-100 py-4 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
        <CardContent className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            {category.icon}
          </div>
          <h3 className="text-sm font-bold text-gray-800">{category.name}</h3>
          {count !== undefined && (
            <span className="text-xs font-medium text-blue-600">
              {count}개 항목
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
