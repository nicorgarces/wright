import { useState, useEffect } from "react";
import {
  PlayCircle,
  Database,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  Download,
  Search,
  AlertCircle,
} from "lucide-react";
import Header from "../../../components/Header";

export default function ScraperAdminPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState("single"); // 'single' or 'all'
  const [icaoInput, setIcaoInput] = useState("");
  const [progress, setProgress] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/scrape-eaip");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    setError(null);
    setProgress(null);

    try {
      const body = scanType === "all" ? { scanAll: true } : { icao: icaoInput };

      const response = await fetch("/api/admin/scrape-eaip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.status}`);
      }

      const result = await response.json();
      setProgress(result);

      // Reload stats after scan
      await loadStats();
    } catch (err) {
      console.error("Scan error:", err);
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <Header />

      {/* Page Header */}
      <div className="bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-2">
            Enhanced eAIP Scraper Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Download individual AD 2 subsections (runway data, operating hours,
            lighting, etc.) from eAIP Colombia - much more organized than
            complete documents!
          </p>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Database
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Airports
                </h3>
              </div>
              <p className="text-3xl font-bold text-black dark:text-white">
                {stats.totalAirports}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle
                    size={20}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Airports Scanned
                </h3>
              </div>
              <p className="text-3xl font-bold text-black dark:text-white">
                {stats.airportsWithDocs}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <FileText
                    size={20}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Documents
                </h3>
              </div>
              <p className="text-3xl font-bold text-black dark:text-white">
                {stats.totalDocuments}
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <HardDrive
                    size={20}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Size
                </h3>
              </div>
              <p className="text-3xl font-bold text-black dark:text-white">
                {formatBytes(stats.totalSize)}
              </p>
            </div>
          </div>
        )}

        {/* Scanner Control Panel */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
            Scan Control Panel
          </h2>

          {/* Scan Type Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Scan Type
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setScanType("single")}
                className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                  scanType === "single"
                    ? "border-[#468BFF] bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Search size={24} className="mx-auto mb-2 text-[#468BFF]" />
                <h3 className="font-semibold text-black dark:text-white mb-1">
                  Single Airport
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Scan one specific airport
                </p>
              </button>

              <button
                onClick={() => setScanType("all")}
                className={`flex-1 px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                  scanType === "all"
                    ? "border-[#468BFF] bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Database size={24} className="mx-auto mb-2 text-[#468BFF]" />
                <h3 className="font-semibold text-black dark:text-white mb-1">
                  All Airports
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Scan all 590+ airports
                </p>
              </button>
            </div>
          </div>

          {/* ICAO Input (only for single scan) */}
          {scanType === "single" && (
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                ICAO Code
              </label>
              <input
                type="text"
                value={icaoInput}
                onChange={(e) => setIcaoInput(e.target.value.toUpperCase())}
                placeholder="e.g., SKBO"
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-[#1E1E1E] text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#468BFF] focus:border-transparent"
              />
            </div>
          )}

          {/* Warning for full scan */}
          {scanType === "all" && (
            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-yellow-600 dark:text-yellow-400 mt-0.5"
                />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Full Scan Warning
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This will scan all 590+ airports and download thousands of
                    documents. This process may take 30-60 minutes and use
                    significant bandwidth. Make sure you have a stable internet
                    connection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Start Scan Button */}
          <button
            onClick={startScan}
            disabled={isScanning || (scanType === "single" && !icaoInput)}
            className="w-full bg-[#468BFF] hover:bg-[#2563EB] text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isScanning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <PlayCircle size={24} />
                Start {scanType === "all" ? "Full" : "Single"} Scan
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <XCircle
                size={24}
                className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Scan Failed
                </h3>
                <p className="text-red-600 dark:text-red-300 mb-3">{error}</p>

                {/* Show attempted URLs if available */}
                {progress && progress.attemptedUrls && (
                  <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-2">
                      Attempted URLs:
                    </p>
                    {progress.attemptedUrls.map((url, i) => (
                      <div
                        key={i}
                        className="text-xs text-red-700 dark:text-red-300 font-mono break-all mb-1"
                      >
                        {url}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Display */}
        {progress && progress.success === false && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={24}
                className="text-yellow-600 dark:text-yellow-400 flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  No Documents Found for {progress.icao}
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  {progress.error}
                </p>

                {/* Debug Information */}
                {progress.debugInfo && progress.debugInfo.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                      🔍 Debug Information
                      <span className="text-xs font-normal">
                        (Click to expand)
                      </span>
                    </h4>
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-yellow-700 dark:text-yellow-300 mb-2 hover:underline">
                        Click to see all tested URLs and patterns
                      </summary>
                      <div className="mt-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="text-xs font-mono text-yellow-800 dark:text-yellow-200 whitespace-pre-wrap">
                          {progress.debugInfo.join("\n")}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}

                {progress.attemptedUrls && (
                  <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      The scraper tried these URLs:
                    </p>
                    {progress.attemptedUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-yellow-700 dark:text-yellow-300 hover:underline font-mono break-all mb-1"
                      >
                        {url}
                      </a>
                    ))}
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      Click the links above to check if the PDFs exist on eAIP
                      Colombia
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Progress Display */}
        {progress && progress.success && (
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Scan Results
            </h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Total Processed
                </div>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {progress.processed || 1} / {progress.total || 1}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Succeeded
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {progress.succeeded || progress.documentsFound || 0}
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Failed
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {progress.failed || 0}
                </div>
              </div>
            </div>

            {/* Single Airport Results */}
            {progress.documentsFound > 0 && progress.subsections && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle
                    size={24}
                    className="text-green-600 dark:text-green-400 flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Successfully Downloaded for {progress.icao}
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      {progress.airportName} - {progress.city}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                      Found <strong>{progress.documentsFound}</strong>{" "}
                      individual subsections
                    </p>
                  </div>
                </div>

                {/* Group subsections by category */}
                <div className="space-y-6">
                  {(() => {
                    const categories = {};
                    progress.subsections.forEach((sub) => {
                      if (!categories[sub.category]) {
                        categories[sub.category] = [];
                      }
                      categories[sub.category].push(sub);
                    });

                    return Object.entries(categories).map(
                      ([category, subs]) => (
                        <div
                          key={category}
                          className="bg-white dark:bg-green-900/30 rounded-lg p-4"
                        >
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 text-sm">
                            📁 {category}
                          </h4>
                          <div className="space-y-2">
                            {subs.map((sub, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/40 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText
                                    size={16}
                                    className="text-green-600 dark:text-green-400"
                                  />
                                  <div>
                                    <div className="text-sm font-medium text-black dark:text-white">
                                      {sub.code} - {sub.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatBytes(sub.fileSize)}
                                    </div>
                                  </div>
                                </div>
                                <a
                                  href={sub.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#468BFF] hover:underline text-sm font-medium flex items-center gap-1"
                                >
                                  <Download size={14} />
                                  View PDF
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Fallback for old format or failed scans */}
            {progress.documentsFound > 0 &&
              !progress.subsections &&
              progress.pdfUrl && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={24}
                      className="text-green-600 dark:text-green-400 flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        Successfully Downloaded for {progress.icao}
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                        {progress.airportName} - {progress.city}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-green-900/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText
                              size={16}
                              className="text-gray-500 dark:text-gray-400"
                            />
                            <div>
                              <div className="text-sm font-medium text-black dark:text-white">
                                AD 2 - Complete Section
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatBytes(progress.fileSize)}
                              </div>
                            </div>
                          </div>
                          <a
                            href={progress.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#468BFF] hover:underline text-sm font-medium"
                          >
                            View PDF
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Full Scan Details */}
            {progress.details && (
              <div>
                <h3 className="font-semibold text-black dark:text-white mb-4">
                  Scan Details ({progress.totalDocuments || "Unknown"} total
                  documents)
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {progress.details.map((detail, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              detail.status === "success"
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-red-100 dark:bg-red-900/30"
                            }`}
                          >
                            {detail.status === "success" ? (
                              <CheckCircle
                                size={16}
                                className="text-green-600 dark:text-green-400"
                              />
                            ) : (
                              <XCircle
                                size={16}
                                className="text-red-600 dark:text-red-400"
                              />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-black dark:text-white">
                              {detail.icao} - {detail.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {detail.status === "success"
                                ? `${detail.documentsFound || 1} documents downloaded`
                                : detail.error}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Show subsection details for successful scans */}
                      {detail.status === "success" &&
                        detail.subsections &&
                        detail.subsections.length > 0 && (
                          <div className="ml-11 mt-3 space-y-1">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                              Subsections found:
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                              {detail.subsections.map((sub, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded"
                                >
                                  {sub.code}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
