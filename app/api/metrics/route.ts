import { NextResponse } from "next/server";
import { fetchMetrics } from "@/lib/alphaVantage";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "").toUpperCase();
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  if (!key) return NextResponse.json({ error: "Missing ALPHA_VANTAGE_API_KEY" }, { status: 500 });
  try {
    const m = await fetchMetrics(symbol, key);
    return NextResponse.json(m);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}


