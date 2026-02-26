export function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: https://pension.jjyu.co.kr/sitemap.xml

#DaumWebMasterTool:d6a6a5055d60b72c407473ca00a2bce482ed1b8daf4464b1bf045995511a2ee1:BCuwDo0LdIrXuMl0DFVoxA==
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
