// src/pages/AirportChartsPage.tsx
import * as React from "react";
import { useParams } from "react-router-dom";
import { getChartsByIcao, groupChartsByType, Chart } from "../lib/charts";

export function AirportChartsPage() {
  const params = useParams();
  const icao = (params.icao || "").toUpperCase();

  const charts = React.useMemo(() => getChartsByIcao(icao), [icao]);
  const grouped = React.useMemo(
    () => groupChartsByType(charts),
    [charts]
  );

  if (!icao) {
    return <div className="p-4">No ICAO provided in the URL.</div>;
  }

  if (charts.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">{icao} – Charts</h1>
        <p>No charts found for this aerodrome.</p>
      </div>
    );
  }

  const chartTypes = Object.keys(grouped);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">
        {icao} – Charts ({charts.length})
      </h1>

      {chartTypes.map((type) => (
        <div key={type} className="space-y-2">
          <h2 className="text-lg font-semibold border-b pb-1">
            {type}
          </h2>
          <ul className="space-y-2">
            {grouped[type].map((chart: Chart) => {
              const runwayLabel = chart.runway ? `RWY ${chart.runway} – ` : "";
              return (
                <li
                  key={chart.key}
                  className="border rounded-md p-3 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-semibold">
                      {runwayLabel}
                      {chart.filename}
                    </div>
                    <div className="text-xs text-gray-500">
                      {chart.section} / {chart.key}
                    </div>
                  </div>
                  <a
                    href={chart.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm px-3 py-1 border rounded-md hover:bg-gray-100"
                  >
                    Open PDF
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
