import { useEffect, useRef } from "react";
import { createChart, IChartApi, ColorType, LineStyle, CrosshairMode } from "lightweight-charts";
import { useQuery } from "@tanstack/react-query";
import { fetchCandles, fetchVolume, fetchIndicators } from "@/lib/api";
import { SkeletonChart, NoData } from "@/components/SkeletonLoaders";

export function ChartSection() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const { data: candles, isLoading: candlesLoading } = useQuery({ queryKey: ["candles"], queryFn: fetchCandles });
  const { data: volume, isLoading: volumeLoading } = useQuery({ queryKey: ["volume"], queryFn: fetchVolume });
  const { data: indicators, isLoading: indicatorsLoading } = useQuery({ queryKey: ["indicators"], queryFn: fetchIndicators });

  const isLoading = candlesLoading || volumeLoading || indicatorsLoading;

  useEffect(() => {
    if (!chartContainerRef.current || isLoading) return;
    if (!candles?.length) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { type: ColorType.Solid, color: "#000000" },
        textColor: "#888888",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1a1a1a" },
        horzLines: { color: "#1a1a1a" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "#2a2a2a",
      },
      timeScale: {
        borderColor: "#2a2a2a",
        timeVisible: true,
      },
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00ff88",
      downColor: "#ff3b3b",
      borderUpColor: "#00ff88",
      borderDownColor: "#ff3b3b",
      wickUpColor: "#00ff88",
      wickDownColor: "#ff3b3b",
    });
    candleSeries.setData(candles);

    if (volume?.length) {
      const volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });
      volumeSeries.setData(volume.map((v: any) => ({
        ...v,
        color: v.color || "#333333",
      })));
    }

    if (indicators?.bb_upper?.length) {
      const opts = { color: "rgba(255,255,255,0.2)", lineWidth: 1 as const, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false };
      chart.addLineSeries(opts).setData(indicators.bb_upper);
      chart.addLineSeries({ ...opts, color: "rgba(255,255,255,0.15)" }).setData(indicators.bb_middle);
      chart.addLineSeries(opts).setData(indicators.bb_lower);
    }

    if (indicators?.sma_20?.length) {
      chart.addLineSeries({ color: "rgba(255,255,255,0.5)", lineWidth: 1 as const, lineStyle: LineStyle.Dotted, priceLineVisible: false, lastValueVisible: false }).setData(indicators.sma_20);
    }
    if (indicators?.sma_50?.length) {
      chart.addLineSeries({ color: "rgba(255,255,255,0.3)", lineWidth: 1 as const, lineStyle: LineStyle.Dotted, priceLineVisible: false, lastValueVisible: false }).setData(indicators.sma_50);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, volume, indicators, isLoading]);

  const lastCandle = candles?.[candles.length - 1];
  const prevCandle = candles?.[candles.length - 2];
  const dayChange = lastCandle && prevCandle
    ? ((lastCandle.close - prevCandle.close) / prevCandle.close * 100).toFixed(2)
    : null;
  const lastVolume = volume?.[volume.length - 1]?.value;

  if (isLoading) return <SkeletonChart height="h-[500px]" />;
  if (!candles?.length) return <NoData message="No candle data available" />;

  return (
    <div className="relative">
      <div ref={chartContainerRef} className="w-full" />
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        {lastCandle && (
          <div className="bg-panel/90 border border-panel-border rounded px-3 py-1 font-mono text-xs">
            <span className="text-muted-foreground mr-1">Close</span>
            <span className="text-foreground">{lastCandle.close?.toLocaleString()}</span>
          </div>
        )}
        {dayChange !== null && (
          <div className="bg-panel/90 border border-panel-border rounded px-3 py-1 font-mono text-xs">
            <span className="text-muted-foreground mr-1">Chg</span>
            <span className={Number(dayChange) >= 0 ? "text-bullish" : "text-bearish"}>
              {Number(dayChange) >= 0 ? "+" : ""}{dayChange}%
            </span>
          </div>
        )}
        {lastVolume && (
          <div className="bg-panel/90 border border-panel-border rounded px-3 py-1 font-mono text-xs">
            <span className="text-muted-foreground mr-1">Vol</span>
            <span className="text-foreground">{(lastVolume / 1e6).toFixed(1)}M</span>
          </div>
        )}
      </div>
    </div>
  );
}
