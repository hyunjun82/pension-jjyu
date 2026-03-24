export const dynamic = 'force-static';

import type { MetadataRoute } from "next";
import { articles } from "@/data/articles";
import { categories } from "@/data/categories";

const BASE_URL = "https://pension.jjyu.co.kr";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // 홈
  const home: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  // about
  const about: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 카테고리 페이지
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/${encodeURIComponent(cat.slug)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 아티클 페이지
  const articlePages: MetadataRoute.Sitemap = Object.entries(articles).flatMap(
    ([categorySlug, items]) =>
      items.map((article) => ({
        url: `${BASE_URL}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(article.slug)}`,
        lastModified: article.dateModified || article.datePublished || now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
  );

  return [...home, ...about, ...categoryPages, ...articlePages];
}
