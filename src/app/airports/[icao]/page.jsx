import { useParams, Link } from "react-router";
import { useMemo, useState } from "react";
import {
  getChartsByIcao,
  groupChartsByType,
} from "../../../lib/charts";

export default function AirportChartsPage() {
  const params = useParams();
  const icao = (params.icao || "").toUpperCase();

  const charts = useMemo(() => getChartsByIcao(icao), [icao]);
  const grouped = useMemo(() => groupChartsByType(charts), [charts]);

  const allChartsFlat = charts;
  const [selectedKey, setSelectedKey] = useState(
    allChartsFlat[0]?.key ?? null
  );

  const selectedChart =
    allChartsFlat.find((c) => c.key === selectedKey) || null;

  if (!icao) {
    return <div className="p-4">No ICAO provided.</div>;
  }

  if (charts.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            {icao} – Charts
          </h1>
          <Link
            to="/airports"
            className="text-sm text-sky-700 hover:underline"
          >
            ← Back to airports
          </Link>
        </div>
        <p>No charts found for this aerodrome.</p>
      </div>
    );
  }

  const chartTypes = Object.keys(grouped);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {icao} – eAIP Charts
          </h1>
          <p className="text-xs text-slate-600">
            Select a chart on the left to preview it on the right. Files are
            served directly from Cloudflare R2.
          </p>
        </div>
        <Link
          to="/airports"
          className="text-sm text-sky-700 hover:underline"
        >
          ← Back to airports
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Left: chart list */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b bg-slate-50 text-xs font-semibold text-slate-600">
            Charts for {icao}
          </div>
          <div className="flex-1 overflow-y-auto">
            {chartTypes.map((type) => (
              <div key={type} className="border-b last:border-b-0">
                <div className="px-4 py-2 text-xs font-semibold uppercase text-slate-500 bg-slate-50">
                  {type}
                </div>
                <ul>
                  {grouped[type].map((chart) => {
                    const isActive = chart.key === selectedKey;
                    const runwayLabel = chart.runway
                      ? `RWY ${chart.runway} – `
                      : "";
                    return (
                      <li key={chart.key}>
                        <button
                          type="button"
                          onClick={() => setSelectedKey(chart.key)}
                          className={
                            "w-full text-left px-4 py-2 text-xs border-t first:border-t-0 " +
                            (isActive
                              ? "bg-sky-50 text-sky-800 border-sky-100"
                              : "bg-white text-slate-700 hover:bg-slate-50")
                          }
                        >
                          <div className="font-medium">
                            {runwayLabel}
                            {chart.filename}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Right: PDF viewer */}
        <div className="lg:col-span-2 bg-slate-50 border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b bg-white flex items-center justify-between">
            <div className="text-xs text-slate-600">
              {selectedChart ? (
                <>
                  <span className="font-semibold text-slate-800">
                    {selectedChart.chart_type}
                  </span>{" "}
                  · {selectedChart.filename}
                </>
              ) : (
                "Select a chart from the list"
              )}
            </div>
            {selectedChart && (
              <a
                href={selectedChart.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-700 hover:underline"
              >
                Open in new tab ↗
              </a>
            )}
          </div>

          <div className="flex-1 bg-slate-100">
            {selectedChart ? (
              <iframe
                key={selectedChart.key}
                src={selectedChart.url}
                title={selectedChart.filename}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">
                Select a chart from the list to preview it here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}