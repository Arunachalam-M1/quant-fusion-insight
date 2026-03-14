import { useEffect, useRef } from "react";
import { createChart, IChartApi, ColorType, CrosshairMode, LineStyle } from "lightweight-charts";
import { useQuery } from "@tanstack/react-query";
import { fetchIndicators } from "@/lib/api";
import { SkeletonChart, NoData } from "@/components/SkeletonLoaders";

function createIndicatorChart(container: HTMLElement, height: number): IChartApi {
  return createChart(container, {
    width: container.clientWidth,
    height,
    layout: {
      background: { type: ColorType.Solid, color: "#000000" },
      textColor: "#888888",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
    },
    grid: {
      vertLines: { color: "#1a1a1a" },
      horzLines: { color: "#1a1a1a" },
    },
    crosshair: { mode: CrosshairMode.Normal },
    rightPriceScale: { borderColor: "#2a2a2a" },
    timeScale: { borderColor: "#2a2a2a", timeVisible: true },
  });
}

function IndicatorPanel({ title, chartRef }: { title: string; chartRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="bg-panel border border-panel-border rounded relative">
      <div className="absolute top-2 left-3 z-10 font-mono text-xs text-muted-foreground">{title}</div>
      <div ref={chartRef} className="w-full" />
    </div>
  );
}

export function IndicatorsSection() {
  const rsiRef = useRef<HTMLDivElement>(null);
  const macdRef = useRef<HTMLDivElement>(null);
  const stochRef = useRef<HTMLDivElement>(null);

  const { data: indicators, isLoading } = useQuery({ queryKey: ["indicators"], queryFn: fetchIndicators });

  useEffect(() => {
    if (isLoading || !indicators) return;

    const charts: IChartApi[] = [];

    if (rsiRef.current && indicators.rsi?.length) {
      const chart = createIndicatorChart(rsiRef.current, 180);
      charts.push(chart);
      const series = chart.addLineSeries({ color: "#ffffff", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      series.setData(indicators.rsi);
      series.createPriceLine({ price: 70, color: "#333", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });
      series.createPriceLine({ price: 30, color: "#333", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });
      chart.timeScale().fitContent();
    }

    if (macdRef.current && indicators.macd_line?.length) {
      const chart = createIndicatorChart(macdRef.current, 180);
      charts.push(chart);
      chart.addLineSeries({ color: "#ffffff", lineWidth: 1, priceLineVisible: false, lastValueVisible: false }).setData(indicators.macd_line);
      chart.addLineSeries({ color: "#666666", lineWidth: 1, priceLineVisible: false, lastValueVisible: false }).setData(indicators.macd_signal);
      if (indicators.macd_hist?.length) {
        const hist = chart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false });
        hist.setData(indicators.macd_hist.map((d: any) => ({ ...d, color: d.value >= 0 ? "#00ff88" : "#ff3b3b" })));
      }
      chart.timeScale().fitContent();
    }

    if (stochRef.current && indicators.stoch_k?.length) {
      const chart = createIndicatorChart(stochRef.current, 180);
      charts.push(chart);
      const kSeries = chart.addLineSeries({ color: "#ffffff", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
      kSeries.setData(indicators.stoch_k);
      if (indicators.stoch_d?.length) {
        chart.addLineSeries({ color: "#666666", lineWidth: 1, priceLineVisible: false, lastValueVisible: false }).setData(indicators.stoch_d);
      }
      kSeries.createPriceLine({ price: 80, color: "#333", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });
      kSeries.createPriceLine({ price: 20, color: "#333", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true });
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      charts.forEach((c, i) => {
        const refs = [rsiRef, macdRef, stochRef];
        if (refs[i]?.current) c.applyOptions({ width: refs[i].current!.clientWidth });
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      charts.forEach((c) => c.remove());
    };
  }, [indicators, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonChart height="h-[180px]" />
        <SkeletonChart height="h-[180px]" />
        <SkeletonChart height="h-[180px]" />
      </div>
    );
  }

  if (!indicators) return <NoData />;

  return (
    <div className="space-y-4">
      <IndicatorPanel title="RSI 14" chartRef={rsiRef} />
      <IndicatorPanel title="MACD 12,26,9" chartRef={macdRef} />
      <IndicatorPanel title="Stoch 14,3" chartRef={stochRef} />
    </div>
  );
}
