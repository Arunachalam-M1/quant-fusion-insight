import { useQuery } from "@tanstack/react-query";
import { fetchSummary, fetchSignals } from "@/lib/api";
import { SkeletonCard, SkeletonTable, NoData } from "@/components/SkeletonLoaders";
import { cn } from "@/lib/utils";

function StatCard({ label, value, colorClass }: { label: string; value: string | number; colorClass?: string }) {
  return (
    <div className="bg-panel border border-panel-border rounded p-4">
      <div className="font-mono text-xs text-muted-foreground mb-1">{label}</div>
      <div className={cn("font-mono text-xl font-semibold", colorClass || "text-foreground")}>
        {value}
      </div>
    </div>
  );
}

export function StatsSection() {
  const { data: summary, isLoading: summaryLoading } = useQuery({ queryKey: ["summary"], queryFn: fetchSummary });
  const { data: signals, isLoading: signalsLoading } = useQuery({ queryKey: ["signals"], queryFn: fetchSignals });

  const dayChangeColor = summary?.day_change >= 0 ? "text-bullish" : "text-bearish";
  const signalColor = summary?.signal === "BULLISH" ? "bg-bullish" : summary?.signal === "BEARISH" ? "bg-bearish" : "bg-muted";
  const signalTextColor = summary?.signal === "BULLISH" || summary?.signal === "BEARISH" ? "text-primary-foreground" : "text-foreground";

  return (
    <div className="space-y-6">
      {/* Top row stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : !summary ? (
          <NoData />
        ) : (
          <>
            <StatCard label="Current Price" value={summary.current_price?.toLocaleString() ?? "—"} />
            <StatCard label="Day Change" value={`${summary.day_change >= 0 ? "+" : ""}${summary.day_change?.toFixed(2)}%`} colorClass={dayChangeColor} />
            <StatCard label="52W High" value={summary.high_52w?.toLocaleString() ?? "—"} />
            <StatCard label="52W Low" value={summary.low_52w?.toLocaleString() ?? "—"} />
          </>
        )}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : !summary ? null : (
          <>
            <StatCard label="Ann. Volatility" value={`${summary.volatility?.toFixed(1)}%`} />
            <StatCard label="CAGR" value={`${summary.cagr?.toFixed(1)}%`} colorClass={summary.cagr >= 0 ? "text-bullish" : "text-bearish"} />
            <StatCard label="Sharpe Ratio" value={summary.sharpe?.toFixed(2) ?? "—"} />
            <StatCard label="Max Drawdown" value={`${summary.max_drawdown?.toFixed(1)}%`} colorClass="text-bearish" />
          </>
        )}
      </div>

      {/* Signal Banner */}
      {summary && (
        <div className={cn("rounded p-4 flex flex-wrap items-center gap-4 font-mono text-sm", signalColor, signalTextColor)}>
          <div className="flex items-center gap-2">
            <span className="font-bold">{summary.signal || "NEUTRAL"}</span>
          </div>
          <div className="h-4 w-px bg-current opacity-30" />
          <div>
            RSI: <span className="font-semibold">{summary.rsi_value?.toFixed(1)}</span>{" "}
            <span className="opacity-70">({summary.rsi_label || "Neutral"})</span>
          </div>
          <div className="h-4 w-px bg-current opacity-30" />
          <div>
            Price {summary.above_sma20 ? "above" : "below"} SMA20
          </div>
        </div>
      )}

      {/* Signals Table */}
      <div className="bg-panel border border-panel-border rounded overflow-hidden">
        <div className="p-3 border-b border-panel-border">
          <h3 className="font-mono text-xs text-muted-foreground">Daily Signals (Last 20 Days)</h3>
        </div>
        {signalsLoading ? (
          <div className="p-4"><SkeletonTable rows={10} /></div>
        ) : !signals?.length ? (
          <NoData />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-panel-border text-muted-foreground">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Signal</th>
                  <th className="text-left p-3 w-48">Score</th>
                </tr>
              </thead>
              <tbody>
                {signals.slice(0, 20).map((row: any, i: number) => {
                  const score = row.score ?? 0;
                  const normalized = ((score + 1) / 2) * 100; // -1 to +1 → 0 to 100
                  const barColor = score >= 0 ? "#00ff88" : "#ff3b3b";
                  return (
                    <tr key={row.date || i} className={i % 2 === 0 ? "bg-background" : "bg-panel"}>
                      <td className="p-3 text-foreground">{row.date}</td>
                      <td className={cn("p-3 font-semibold", row.signal === "BULLISH" ? "text-bullish" : row.signal === "BEARISH" ? "text-bearish" : "text-muted-foreground")}>
                        {row.signal}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                            <div
                              className="h-full rounded transition-all"
                              style={{ width: `${normalized}%`, backgroundColor: barColor }}
                            />
                          </div>
                          <span className="text-muted-foreground w-10 text-right">{score.toFixed(2)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
