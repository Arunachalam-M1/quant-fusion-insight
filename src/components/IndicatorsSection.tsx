import { useEffect, useRef } from "react";
import { createChart, LineSeries, HistogramSeries } from "lightweight-charts";
import { useQuery } from "@tanstack/react-query";
import { fetchIndicators } from "@/lib/api";
import { SkeletonChart, NoData } from "@/components/SkeletonLoaders";

function createIndicatorChart(container: HTMLElement, height: number) {
  return createChart(container, {
    width: container.clientWidth,
    height,
    layout: {
      background: { color: "#000000" },
      textColor: "#888888",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
    },
    grid: {
      vertLines: { color: "#1a1a1a" },
      horzLines: { color: "#1a1a1a" },
    },
    crosshair: {
      mode: 0,
      vertLine: { color: "#444", width: 1, style: 2 },
      horzLine: { color: "#444", width: 1, style: 2 },
    },
    rightPriceScale: { borderColor: "#2a2a2a" },
    timeScale: { borderColor: "#2a2a2a", timeVisible: true },
  });
}

function IndicatorPanel({ title, children, chartRef }: { title: string; children: React.ReactNode; chartRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="bg-panel border border-panel-border rounded relative">
      <div className="absolute top-2 left-3 z-10 font-mono text-xs text-muted-foreground">
        {title}
      </div>
      <div ref={chartRef} className="w-full" />
      {children}
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

    const charts: any[] = [];

    // RSI Chart
    if (rsiRef.current && indicators.rsi?.length) {
      const chart = createIndicatorChart(rsiRef.current, 180);
      charts.push(chart);

      const rsiSeries = chart.addSeries(LineSeries, {
        color: "#ffffff",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      rsiSeries.setData(indicators.rsi);

      // Overbought/Oversold lines
      rsiSeries.createPriceLine({ price: 70, color: "#333", lineWidth: 1, lineStyle: 2, axisLabelVisible: true });
      rsiSeries.createPriceLine({ price: 30, color: "#333", lineWidth: 1, lineStyle: 2, axisLabelVisible: true });

      chart.priceScale("right").applyOptions({ autoScale: false, scaleMargins: { top: 0.05, bottom: 0.05 } });
      chart.timeScale().fitContent();
    }

    // MACD Chart
    if (macdRef.current && indicators.macd_line?.length) {
      const chart = createIndicatorChart(macdRef.current, 180);
      charts.push(chart);

      const macdLine = chart.addSeries(LineSeries, {
        color: "#ffffff",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      macdLine.setData(indicators.macd_line);

      const signalLine = chart.addSeries(LineSeries, {
        color: "#666666",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      signalLine.setData(indicators.macd_signal);

      if (indicators.macd_hist?.length) {
        const histSeries = chart.addSeries(HistogramSeries, {
          priceLineVisible: false,
          lastValueVisible: false,
        });
        histSeries.setData(indicators.macd_hist.map((d: any) => ({
          ...d,
          color: d.value >= 0 ? "#00ff88" : "#ff3b3b",
        })));
      }

      chart.timeScale().fitContent();
    }

    // Stochastic Chart
    if (stochRef.current && indicators.stoch_k?.length) {
      const chart = createIndicatorChart(stochRef.current, 180);
      charts.push(chart);

      const kLine = chart.addSeries(LineSeries, {
        color: "#ffffff",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      kLine.setData(indicators.stoch_k);

      if (indicators.stoch_d?.length) {
        const dLine = chart.addSeries(LineSeries, {
          color: "#666666",
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        dLine.setData(indicators.stoch_d);
      }

      kLine.createPriceLine({ price: 80, color: "#333", lineWidth: 1, lineStyle: 2, axisLabelVisible: true });
      kLine.createPriceLine({ price: 20, color: "#333", lineWidth: 1, lineStyle: 2, axisLabelVisible: true });

      chart.priceScale("right").applyOptions({ autoScale: false, scaleMargins: { top: 0.05, bottom: 0.05 } });
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      charts.forEach((c) => {
        const container = c.options().width;
        // resize handled via chart container
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
      <IndicatorPanel title="RSI 14" chartRef={rsiRef}><></></IndicatorPanel>
      <IndicatorPanel title="MACD 12,26,9" chartRef={macdRef}><></></IndicatorPanel>
      <IndicatorPanel title="Stoch 14,3" chartRef={stochRef}><></></IndicatorPanel>
    </div>
  );
}
