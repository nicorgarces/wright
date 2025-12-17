"use client";

import React, { useState, useMemo, useEffect } from "react";
import { getAirportSummaries, getChartsByIcao } from "../../lib/charts";
import Header from "../../components/Header";
import AirportsMap from "../../components/AirportsMap";
import useLanguage from "../../utils/useLanguage";
import { t } from "../../utils/translations";
import airportInfo from "../../data/airportInfo.mjs";
import "leaflet/dist/leaflet.css"; // safe: just CSS

// ---------- helpers ----------

// Build display label like: "SKBO - EL DORADO"
function getAirportLabel(icao) {
  if (!icao) return "";

  const info = airportInfo[icao] || {};
  const name = info.name?.trim();
  const city = info.city?.trim();
  const country = info.country?.trim();

  if (name) return `${icao} - ${name}`;
  if (city) return `${icao} - ${city}`;
  if (country && country.toUpperCase() !== "COLOMBIA") {
    return `${icao} - ${country}`;
  }
  return icao;
}

// We rely on the precomputed flag from airportInfo.mjs
function isControlledAirport(icao) {
  const info = airportInfo[icao];
  return info && info.isControlled === true;
}

function AirportInfoPanel({ icao, onClose }) {
  if (!icao) {
    return (
      <div className="text-sm text-slate-500">
        Select an airport from the list to see its information here.
      </div>
    );
  }

  const info = airportInfo[icao] || {};
  const label = getAirportLabel(icao);
  const freqs = Array.isArray(info.frequencies) ? info.frequencies : [];

  return (
    <div className="space-y-3 text-sm">
      {/* Title row */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="font-semibold text-slate-900">{label}</div>
          {(info.city || info.country) && (
            <div className="text-xs text-slate-500">
              {[info.city, info.country].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {info.elevationFt && (
            <div className="text-xs text-slate-500">
              Elevation: {info.elevationFt.toLocaleString()} ft
            </div>
          )}
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="ml-2 text-xs text-slate-400 hover:text-slate-700"
            title="Deselect airport"
          >
            × Close
          </button>
        </div>  
      </div>

      {/* Summary + Communications laid out horizontally */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Summary / text block */}
        <div className="md:col-span-1 text-xs text-slate-600 space-y-1">
          {info.summary ? (
            <p className="leading-snug max-h-32 overflow-y-auto">
              {info.summary}
            </p>
          ) : (
            <p className="text-slate-500">
              Detailed eAIP information for this aerodrome will be added soon.
              Charts are already available.
            </p>
          )}
        </div>

        {/* Communications */}
        {freqs.length > 0 && (
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              Communications
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-slate-600">
              {freqs.map((f, idx) => (
                <div key={`${icao}-freq-${idx}`}>
                  <span className="font-mono">{f.freq}</span>{" "}
                  {f.service && (
                    <span className="font-medium">{f.service}</span>
                  )}
                  {f.description && <span>{` – ${f.description}`}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- main page ----------

export default function AirportsPage() {
  const { language } = useLanguage();

  // Airports and initial selection
  const allAirports = useMemo(() => getAirportSummaries(), []);
  // Start with NO airport selected → map visible by default
  const [selectedIcao, setSelectedIcao] = useState(null);

  // Search + control filter
  const [query, setQuery] = useState("");
  const [controlFilter, setControlFilter] = useState("ALL"); // "ALL" | "CONTROLLED" | "UNCONTROLLED"
  const [visibleAirportCount, setVisibleAirportCount] = useState(10);

  // Chart filters
  const [chartTypeFilter, setChartTypeFilter] = useState("ALL");
  const [chartSearch, setChartSearch] = useState("");
  const [selectedChartKey, setSelectedChartKey] = useState(null);

  // Charts for the selected airport
  const chartsForSelectedIcao = useMemo(() => {
    if (!selectedIcao) return [];
    return getChartsByIcao(selectedIcao);
  }, [selectedIcao]);

  // Unique chart types for the selected airport
  const chartTypesForSelected = useMemo(() => {
    const set = new Set();
    chartsForSelectedIcao.forEach((c) => {
      if (c.chart_type) set.add(c.chart_type);
    });
    return Array.from(set).sort();
  }, [chartsForSelectedIcao]);

  // Filtered charts based on search + type
  const filteredCharts = useMemo(() => {
    const search = chartSearch.trim().toLowerCase();

    return chartsForSelectedIcao.filter((chart) => {
      if (chartTypeFilter !== "ALL" && chart.chart_type !== chartTypeFilter) {
        return false;
      }

      if (search) {
        const haystack = `${chart.filename} ${chart.chart_type || ""} ${chart.runway || ""
          }`
          .toLowerCase()
          .replace(/\s+/g, " ");
        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [chartsForSelectedIcao, chartTypeFilter, chartSearch]);

  // When airport changes → reset filters & pick first chart
  useEffect(() => {
    setChartTypeFilter("ALL");
    setChartSearch("");
    if (chartsForSelectedIcao.length > 0) {
      setSelectedChartKey(chartsForSelectedIcao[0].key);
    } else {
      setSelectedChartKey(null);
    }
  }, [selectedIcao, chartsForSelectedIcao]);

  // Keep selected chart in sync with filtered list
  useEffect(() => {
    if (
      selectedChartKey &&
      filteredCharts.some((c) => c.key === selectedChartKey)
    ) {
      return;
    }
    setSelectedChartKey(filteredCharts[0]?.key || null);
  }, [filteredCharts, selectedChartKey]);

  const selectedChart =
    (selectedChartKey &&
      filteredCharts.find((c) => c.key === selectedChartKey)) ||
    null;

  // Filter airports (search + control type) and keep SKBO on top
  const filteredAirports = useMemo(() => {
    const q = query.trim().toUpperCase();

    const base = allAirports.filter((a) => {
      if (q && !a.icao.toUpperCase().includes(q)) return false;

      if (controlFilter !== "ALL") {
        const controlled = isControlledAirport(a.icao);
        if (controlFilter === "CONTROLLED" && !controlled) return false;
        if (controlFilter === "UNCONTROLLED" && controlled) return false;
      }

      return true;
    });

    const skbo = base.find((a) => a.icao === "SKBO");
    const others = base.filter((a) => a.icao !== "SKBO");
    return skbo ? [skbo, ...others] : others;
  }, [allAirports, query, controlFilter]);

  // Only show the first N airports, with "Show more" button
  useEffect(() => {
    // whenever search text or control type changes, reset to first 10
    setVisibleAirportCount(10);
  }, [query, controlFilter]);

  const visibleAirports = useMemo(
    () => filteredAirports.slice(0, visibleAirportCount),
    [filteredAirports, visibleAirportCount]
  );

  const totalAirports = filteredAirports.length;

  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 pt-2 pb-4 lg:pt-3 lg:pb-6">
          {/* Page header */}
          <div className="mb-2 sm:mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-600 mb-1">
              {t(language, "airports.title") || "Colombian Airports"}
            </h1>
            <p className="text-sm text-slate-600 max-w-5xl">
              Select an airport and refine the chart list using the search and
              filters. By default, the right panel shows a map with Colombian
              aerodromes status.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* LEFT PANEL – airport list & control filter */}
            <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col">
              {/* Search */}
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1">
                  Search airport
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SKBO, SKCL."
                  className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* CONTROL TYPE BUTTONS */}
              <div className="mb-4">
                <div className="text-[11px] font-semibold text-slate-500 tracking-wide mb-1">
                  CONTROL TYPE
                </div>

                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  {["ALL", "CONTROLLED", "UNCONTROLLED"].map((value) => {
                    const label =
                      value === "ALL"
                        ? "All"
                        : value === "CONTROLLED"
                          ? "Controlled"
                          : "Uncontrolled";
                    const active = controlFilter === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setControlFilter(value)}
                        className={
                          "px-3 py-1.5 rounded-md font-medium transition-colors " +
                          (active
                            ? "bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white shadow-sm"
                            : "text-slate-600 hover:bg-white")
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* airports count under the buttons */}
                <p className="mt-2 text-xs text-slate-500">
                  {filteredAirports.length} airports found
                </p>
              </div>

              {/* Airport list */}
              <div className="mt-0 max-h-[60vh] overflow-y-auto pr-1">
                {filteredAirports.map((a) => {
                  const label = getAirportLabel(a.icao);
                  const isActive = selectedIcao === a.icao;
                  const chartCount = a.chartCount ?? 0;
                  const info = airportInfo[a.icao] || {};

                  return (
                    <button
                      key={a.icao}
                      type="button"
                      onClick={() => {
                        if(selectedIcao === a.icao) {
                          setSelectedIcao(null);
                        } else {
                          // Otherwise select the new airport
                          setSelectedIcao(a.icao);
                        }
                      }}    
                      className={
                        "w-full text-left mb-2 last:mb-0 rounded-lg border px-3 py-2 transition-colors " +
                        (selectedIcao === a.icao
                          ? "border-sky-500 bg-sky-50"
                          : "border-slate-200 bg-white hover:bg-slate-50")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 text-sm">
                          {label}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {chartCount} charts
                        </span>
                      </div>

                      {/* Elevation */}
                      {info.elevationFt && (
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          Elevation: {info.elevationFt.toLocaleString()} ft
                        </div>
                      )}

                      {/* Operations hours / Explotador del AD */}
                      {info?.operator && (
                        <p className="text-xs text-slate-500">
                          Operating Hours: {info.operator}
                        </p>
                      )}
                      
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL – info + chart filters + viewer / map */}
            <div className="lg:col-span-2 bg-slate-50 border rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="flex-1 bg-slate-100 flex flex-col">
                {/* Airport info */}
                <div className="bg-white px-6 py-5 border-b">
                  <AirportInfoPanel 
                    icao={selectedIcao} 
                    onClose={() => setSelectedIcao(null)}
                  ></AirportInfoPanel>
                </div>

                {/* Chart filters – on the right panel */}
                <div className="px-6 py-3 border-b bg-slate-50 flex flex-wrap gap-3 items-center">
                  {/* Chart dropdown */}
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1">
                      Chart
                    </label>
                    <select
                      value={selectedChartKey || ""}
                      onChange={(e) =>
                        setSelectedChartKey(e.target.value || null)
                      }
                      disabled={!selectedIcao || filteredCharts.length === 0}
                      className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {!selectedChartKey && (
                        <option value="">
                          {selectedIcao
                            ? "Select a chart..."
                            : "Select an airport first"}
                        </option>
                      )}
                      {filteredCharts.map((chart) => (
                        <option key={chart.key} value={chart.key}>
                          {chart.chart_type
                            ? `${chart.chart_type} · ${chart.filename}`
                            : chart.filename}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search chart name */}
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1">
                      Search chart name
                    </label>
                    <input
                      type="text"
                      value={chartSearch}
                      onChange={(e) => setChartSearch(e.target.value)}
                      placeholder="e.g. IAC RWY 13L"
                      disabled={!selectedIcao}
                      className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  {/* Chart type */}
                  <div className="w-full sm:w-48">
                    <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-1">
                      Chart type
                    </label>
                    <select
                      value={chartTypeFilter}
                      onChange={(e) => setChartTypeFilter(e.target.value)}
                      disabled={!selectedIcao}
                      className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="ALL">All types</option>
                      {chartTypesForSelected.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main content: map when no airport selected, otherwise chart / empty state */}
                {!selectedIcao ? (
                  <div className="flex-1">
                    <AirportsMap
                      airports={filteredAirports}
                      selectedIcao={selectedIcao}
                      onSelectIcao={setSelectedIcao}
                    />
                  </div>
                ) : selectedChart ? (
                  <>
                    {/* Chart header + preview */}
                    <div className="px-4 py-2 border-b bg-white flex items-center justify-between gap-3 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-800">
                          {selectedChart.chart_type}
                        </span>
                        {` · ${selectedChart.filename}`}
                      </div>
                      <a
                        href={selectedChart.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-700 hover:underline whitespace-nowrap"
                      >
                        Open in new tab ↗
                      </a>
                    </div>

                    <div className="flex-1 bg-slate-100">
                      <iframe
                        key={selectedChart.key}
                        src={selectedChart.url}
                        title={selectedChart.filename}
                        className="w-full h-full border-0"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-500 px-4 text-center">
                    Select a chart from the controls above to preview the PDF
                    here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
