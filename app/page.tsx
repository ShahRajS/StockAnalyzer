"use client";

import { useCallback, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  previousClose?: number;
};

type Metrics = {
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
};

type HistoryPoint = { date: string; close: number };

type NewsItem = { title: string; url: string; source?: string; publishedAt?: string };

export default function HomePage() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  const loadData = useCallback(async () => {
    const sym = ticker.trim().toUpperCase();
    if (!sym) return;
    setLoading(true);
    setError(null);
    try {
      const [qRes, mRes, hRes, nRes] = await Promise.all([
        fetch(`/api/quote?symbol=${encodeURIComponent(sym)}`),
        fetch(`/api/metrics?symbol=${encodeURIComponent(sym)}`),
        fetch(`/api/history?symbol=${encodeURIComponent(sym)}`),
        fetch(`/api/news?symbol=${encodeURIComponent(sym)}`),
      ]);
      if (!qRes.ok) throw new Error("Failed to fetch quote");
      if (!mRes.ok) throw new Error("Failed to fetch metrics");
      if (!hRes.ok) throw new Error("Failed to fetch history");
      // news is optional; don't throw on failure
      const [q, m, h, n] = await Promise.all([
        qRes.json(),
        mRes.json(),
        hRes.json(),
        nRes.ok ? nRes.json() : Promise.resolve({ items: [] }),
      ]);
      setQuote(q);
      setMetrics(m);
      setHistory(h.points ?? []);
      setNews(n.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setQuote(null);
      setMetrics(null);
      setHistory([]);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  const explanation = useMemo(() => {
    if (!quote) return "Enter a ticker to see analysis.";
    const parts: string[] = [];
    const dir = quote.change >= 0 ? "up" : "down";
    parts.push(`\`${quote.symbol}\` is ${dir} ${quote.changePercent.toFixed(2)}% today.`);
    if (metrics?.peRatio) {
      parts.push(`P/E is ${metrics.peRatio.toFixed(2)}${metrics.peRatio > 25 ? ", elevated versus market" : ""}.`);
    }
    if (metrics?.fiftyTwoWeekHigh && metrics?.fiftyTwoWeekLow && quote.price) {
      const range = metrics.fiftyTwoWeekHigh - metrics.fiftyTwoWeekLow;
      const pos = (quote.price - metrics.fiftyTwoWeekLow) / (range || 1);
      parts.push(`Price is at ${(pos * 100).toFixed(0)}% of its 52-week range.`);
    }
    if (news.length) {
      parts.push("Recent headlines may be influencing the move.");
    }
    return parts.join(" \n");
  }, [quote, metrics, news]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, textAlign: "center", color: "#ffffff" }}>
        MarketMoves: Stock Analyzer
      </h1>
      <p style={{ marginTop: 8, color: "#ffffff" }}>Enter a US ticker (e.g., AAPL, MSFT, NVDA)</p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") loadData(); }}
          placeholder="Ticker"
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            outline: "none",
            width: 200,
            background: "#ffffff",
          }}
        />
        <button
          onClick={loadData}
          disabled={loading || !ticker.trim()}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #0ea5e9",
            background: loading ? "#e2e8f0" : "#0ea5e9",
            color: loading ? "#475569" : "#ffffff",
            cursor: loading ? "default" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Loading..." : "Analyze"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, color: "#991b1b" }}>
          {error}
        </div>
      )}

      {quote && (
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 24 }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>Symbol</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{quote.symbol}</div>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>Price</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>${quote.price.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: quote.change >= 0 ? "#166534" : "#991b1b" }}>
              {quote.change >= 0 ? "+" : ""}{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
            </div>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>Volume</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{quote.volume?.toLocaleString() ?? "-"}</div>
          </div>
        </section>
      )}

      {metrics && (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginTop: 16 }}>
          <Metric label="Market Cap" value={metrics.marketCap ? formatCurrency(metrics.marketCap) : "-"} />
          <Metric label="P/E" value={metrics.peRatio ? metrics.peRatio.toFixed(2) : "-"} />
          <Metric label="Dividend Yield" value={metrics.dividendYield ? `${(metrics.dividendYield * 100).toFixed(2)}%` : "-"} />
          <Metric label="52W High" value={metrics.fiftyTwoWeekHigh ? `$${metrics.fiftyTwoWeekHigh.toFixed(2)}` : "-"} />
          <Metric label="52W Low" value={metrics.fiftyTwoWeekLow ? `$${metrics.fiftyTwoWeekLow.toFixed(2)}` : "-"} />
        </section>
      )}

      {history.length > 0 && (
        <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginTop: 24 }}>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>Price Trend (6 months)</div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" hide tick={{ fontSize: 12 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} width={60} />
                <Tooltip formatter={(val: any) => `$${Number(val).toFixed(2)}`} labelStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="close" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {(quote || news.length > 0) && (
        <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginTop: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Why is it moving?</div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{explanation}</div>
          {news.length > 0 && (
            <ul style={{ marginTop: 12, paddingLeft: 18 }}>
              {news.slice(0, 5).map((n, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  <a href={n.url} target="_blank" rel="noreferrer" style={{ color: "#0ea5e9", textDecoration: "none" }}>
                    {n.title}
                  </a>
                  {n.source ? <span style={{ color: "#64748b" }}>{`  ·  ${n.source}`}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function formatCurrency(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(0)}`;
}


