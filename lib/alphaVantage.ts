const BASE = "https://www.alphavantage.co/query";

export async function fetchQuote(symbol: string, apiKey: string) {
  const url = `${BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Alpha Vantage quote error");
  const data = await res.json();
  const q = data["Global Quote"] || {};
  const price = parseFloat(q["05. price"]) || 0;
  const prev = parseFloat(q["08. previous close"]) || 0;
  const change = price - prev;
  const changePercent = prev ? (change / prev) * 100 : 0;
  return {
    symbol: q["01. symbol"] || symbol,
    price,
    change,
    changePercent,
    volume: Number(q["06. volume"]) || undefined,
    previousClose: prev || undefined,
  };
}

export async function fetchMetrics(symbol: string, apiKey: string) {
  // Use OVERVIEW endpoint for basic fundamentals
  const url = `${BASE}?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Alpha Vantage metrics error");
  const d = await res.json();
  return {
    marketCap: d?.MarketCapitalization ? Number(d.MarketCapitalization) : undefined,
    peRatio: d?.PERatio ? Number(d.PERatio) : undefined,
    dividendYield: d?.DividendYield ? Number(d.DividendYield) : undefined,
    fiftyTwoWeekHigh: d?.["52WeekHigh"] ? Number(d["52WeekHigh"]) : undefined,
    fiftyTwoWeekLow: d?.["52WeekLow"] ? Number(d["52WeekLow"]) : undefined,
  };
}

export async function fetchDailyHistory(symbol: string, apiKey: string) {
  const url = `${BASE}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Alpha Vantage history error");
  const d = await res.json();
  const ts = d["Time Series (Daily)"] || {};
  const points = Object.entries(ts)
    .map(([date, ohlc]: any) => ({ date, close: Number(ohlc["4. close"]) }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-126); // ~6 months of trading days
  return { points };
}


