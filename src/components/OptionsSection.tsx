import { useQuery } from "@tanstack/react-query";
import { fetchOptionsOI, fetchOptionsPCR } from "@/lib/api";
import { SkeletonChart, SkeletonTable, NoData } from "@/components/SkeletonLoaders";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine,
} from "recharts";

export function OptionsSection() {
  const { data: oiData, isLoading: oiLoading } = useQuery({ queryKey: ["optionsOI"], queryFn: fetchOptionsOI });
  const { data: pcrData, isLoading: pcrLoading } = useQuery({ queryKey: ["optionsPCR"], queryFn: fetchOptionsPCR });

  const oiChartData = oiData?.data?.map((d: any) => ({
    strike: d.strike,
    CE_OI: d.CE_OI,
    PE_OI: -d.PE_OI, // negative for left side
  })) || [];

  const tableData = oiData?.data || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OI Butterfly Chart */}
        <div className="bg-panel border border-panel-border rounded p-4">
          <h3 className="font-mono text-xs text-muted-foreground mb-4">CE vs PE Open Interest by Strike</h3>
          {oiLoading ? <SkeletonChart height="h-[300px]" /> : !oiChartData.length ? <NoData /> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={oiChartData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: "#888", fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={{ stroke: "#2a2a2a" }} />
                <YAxis dataKey="strike" type="category" tick={{ fill: "#888", fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={{ stroke: "#2a2a2a" }} width={60} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", fontFamily: "'JetBrains Mono'", fontSize: 11 }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value: any, name: string) => [Math.abs(value).toLocaleString(), name === "PE_OI" ? "PE OI" : "CE OI"]}
                />
                <Bar dataKey="CE_OI" fill="#ffffff" radius={[0, 2, 2, 0]} />
                <Bar dataKey="PE_OI" fill="#555555" radius={[2, 0, 0, 2]} />
                <ReferenceLine x={0} stroke="#2a2a2a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* PCR Line Chart */}
        <div className="bg-panel border border-panel-border rounded p-4">
          <h3 className="font-mono text-xs text-muted-foreground mb-4">Put-Call Ratio (Daily)</h3>
          {pcrLoading ? <SkeletonChart height="h-[300px]" /> : !pcrData?.length ? <NoData /> : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pcrData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fill: "#888", fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={{ stroke: "#2a2a2a" }} />
                <YAxis tick={{ fill: "#888", fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={{ stroke: "#2a2a2a" }} domain={[0.4, 1.8]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", fontFamily: "'JetBrains Mono'", fontSize: 11 }}
                  labelStyle={{ color: "#fff" }}
                />
                <ReferenceLine y={1.0} stroke="#444" strokeDasharray="5 5" label={{ value: "Neutral", fill: "#666", fontSize: 10 }} />
                <ReferenceLine y={0.7} stroke="#ff3b3b33" strokeDasharray="5 5" label={{ value: "Bearish", fill: "#ff3b3b88", fontSize: 10 }} />
                <ReferenceLine y={1.3} stroke="#00ff8833" strokeDasharray="5 5" label={{ value: "Bullish", fill: "#00ff8888", fontSize: 10 }} />
                <Line type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* OI Table */}
      <div className="bg-panel border border-panel-border rounded overflow-hidden">
        <div className="p-3 border-b border-panel-border">
          <h3 className="font-mono text-xs text-muted-foreground">Open Interest Data {oiData?.date && `· ${oiData.date}`}</h3>
        </div>
        {oiLoading ? <div className="p-4"><SkeletonTable rows={8} /></div> : !tableData.length ? <NoData /> : (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-panel-border text-muted-foreground">
                  <th className="text-left p-3">Strike</th>
                  <th className="text-right p-3">CE OI</th>
                  <th className="text-right p-3">PE OI</th>
                  <th className="text-right p-3">PCR</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row: any, i: number) => (
                  <tr key={row.strike} className={i % 2 === 0 ? "bg-background" : "bg-panel"}>
                    <td className="p-3 text-foreground">{row.strike}</td>
                    <td className="p-3 text-right text-foreground">{row.CE_OI?.toLocaleString()}</td>
                    <td className="p-3 text-right text-foreground">{row.PE_OI?.toLocaleString()}</td>
                    <td className="p-3 text-right text-muted-foreground">
                      {row.CE_OI ? (row.PE_OI / row.CE_OI).toFixed(2) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
