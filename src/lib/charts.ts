// apps/web/src/lib/charts.ts
import charts from "../data/charts_index.json";

export type Chart = {
  icao: string | null;
  section: string;
  filename: string;
  key: string;
  chart_type: string;
  runway: string | null;
  url: string;
};

export const allCharts = charts as Chart[];

export function getChartsByIcao(icao?: string | null): Chart[] {
  // If nothing selected yet, just return an empty list
  if (!icao) return [];

  const code = icao.toUpperCase();
  return allCharts.filter((c) => c.icao === code);
}

export function groupChartsByType(charts: Chart[]): Record<string, Chart[]> {
  return charts.reduce((acc, chart) => {
    const t = chart.chart_type || "OTHER";
    if (!acc[t]) acc[t] = [];
    acc[t].push(chart);
    return acc;
  }, {} as Record<string, Chart[]>);
}

export function getAirportSummaries(): { icao: string; chartCount: number }[] {
  const counts = new Map<string, number>();

  for (const chart of allCharts) {
    if (!chart.icao) continue;
    const current = counts.get(chart.icao) ?? 0;
    counts.set(chart.icao, current + 1);
  }

  const result = Array.from(counts.entries()).map(([icao, chartCount]) => ({
    icao,
    chartCount,
  }));

  result.sort((a, b) => a.icao.localeCompare(b.icao));

  return result;
}
