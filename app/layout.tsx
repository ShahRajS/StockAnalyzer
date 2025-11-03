export const metadata = {
  title: "MarketMoves Stock Analyzer",
  description: "Enter a US stock ticker to see price, metrics, trend, and explanations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        color: "#383333",
        background: "linear-gradient(to bottom, #280a7b, #980606)",
      }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}


