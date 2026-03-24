export const dynamic = 'force-static';

import { articles } from "@/data/articles";

const BASE_URL = "https://pension.jjyu.co.kr";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const allArticles = Object.entries(articles)
    .flatMap(([categorySlug, items]) =>
      items.map((article) => ({
        ...article,
        categorySlug,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.datePublished || "").getTime() -
        new Date(a.datePublished || "").getTime()
    );

  const items = allArticles
    .map(
      (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${BASE_URL}/${encodeURIComponent(article.categorySlug)}/${encodeURIComponent(article.slug)}</link>
      <description>${escapeXml(article.description)}</description>
      <pubDate>${new Date(article.datePublished || "").toUTCString()}</pubDate>
      <guid>${BASE_URL}/${encodeURIComponent(article.categorySlug)}/${encodeURIComponent(article.slug)}</guid>
      <category>${escapeXml(article.categorySlug)}</category>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>기초연금 정보</title>
    <link>${BASE_URL}</link>
    <description>2026년 기초연금 수급자격, 모의계산, 신청방법 안내</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
