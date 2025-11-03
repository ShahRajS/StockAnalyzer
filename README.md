## MarketMoves: Stock Analyzer

Enter a US stock ticker and view current price, key metrics, a 6-month trend line, and an explanation panel with recent headlines.

### Prerequisites
- Node.js 18+
- Free API key from Alpha Vantage (`https://www.alphavantage.co`)
- Optional: NewsAPI key (`https://newsapi.org`) for headlines

### Setup
1. Install deps:
   ```bash
   npm install
   ```
2. Copy `env.sample` to `.env.local` and set values:
   ```bash
   cp env.sample .env.local
   # edit .env.local and add your keys
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` and enter a ticker (e.g., AAPL).

### Notes
- Data: Quote, metrics, and history use Alpha Vantage. Respect their rate limits (5 req/min free tier).
- News is optional. If `NEWSAPI_KEY` is not set, the app will skip headlines.
- This project uses Next.js (App Router) and Recharts for visualization.


