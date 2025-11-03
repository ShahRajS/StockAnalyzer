import { NextResponse } from "next/server";

// Simple news via NewsAPI.org company name query (requires NEWSAPI_KEY). Optional.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "").toUpperCase();
  const key = process.env.NEWSAPI_KEY;
  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  if (!key) return NextResponse.json({ items: [] });
  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(symbol)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${key}`;
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ items: [] });
    const data = await res.json();
    const items = (data.articles || []).map((a: any) => ({
      title: a.title,
      url: a.url,
      source: a.source?.name,
      publishedAt: a.publishedAt,
    }));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}


