import { useState, useEffect } from "react";
import {
  Upload,
  Download,
  Database,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Trash2,
} from "lucide-react";
import Header from "../../../components/Header";

export default function AdminAirportsPage() {
  const [stats, setStats] = useState(null);
  const [importData, setImportData] = useState("");
  const [importStatus, setImportStatus] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [exampleData, setExampleData] = useState(null);

  useEffect(() => {
    loadStats();
    loadExampleData();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/airports?limit=1");
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalAirports: data.pagination.total,
          lastUpdated: new Date().toLocaleDateString(),
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadExampleData = async () => {
    try {
      const response = await fetch("/api/airports/bulk-import");
      if (response.ok) {
        const data = await response.json();
        setExampleData(data);
      }
    } catch (error) {
      console.error("Error loading example data:", error);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      setImportStatus({
        type: "error",
        message: "Please paste your JSON data before importing.",
      });
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      // Parse and validate JSON
      const parsedData = JSON.parse(importData);

      if (!parsedData.airports || !Array.isArray(parsedData.airports)) {
        throw new Error('Data must have an "airports" array property');
      }

      const response = await fetch("/api/airports/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Import failed");
      }

      setImportStatus({
        type: "success",
        message: "Import completed successfully!",
        details: result,
      });

      // Refresh stats
      loadStats();
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus({
        type: "error",
        message: error.message,
        details: error.name === "SyntaxError" ? "Invalid JSON format" : null,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const clearData = () => {
    setImportData("");
    setImportStatus(null);
  };

  const loadExampleIntoEditor = () => {
    if (exampleData?.example_format) {
      setImportData(JSON.stringify(exampleData.example_format, null, 2));
      setShowExample(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <Header />

      {/* Page Header */}
      <div className="bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Airport Data Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Import and manage Colombian airport data
          </p>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Actions */}
          <div className="lg:col-span-1">
            {/* Database Stats */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <Database size={20} />
                Database Status
              </h2>

              {stats ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Total Airports
                    </span>
                    <span className="font-bold text-2xl text-[#468BFF]">
                      {stats.totalAirports}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Last Updated
                    </span>
                    <span className="font-semibold text-black dark:text-white">
                      {stats.lastUpdated}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">
                      Status
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={16} />
                      Online
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <RefreshCw
                    className="animate-spin mx-auto mb-2 text-gray-400"
                    size={24}
                  />
                  <p className="text-gray-500">Loading stats...</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a
                  href="/airports"
                  className="flex items-center gap-2 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-white transition-colors duration-200"
                >
                  <Eye size={16} />
                  View All Airports
                </a>
                <a
                  href="/admin/documents"
                  className="flex items-center gap-2 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-white transition-colors duration-200"
                >
                  <FileText size={16} />
                  Manage Documents
                </a>
                <button
                  onClick={() => setShowExample(!showExample)}
                  className="flex items-center gap-2 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-white transition-colors duration-200"
                >
                  <FileText size={16} />
                  View Data Format
                </button>
                <button
                  onClick={loadStats}
                  className="flex items-center gap-2 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-white transition-colors duration-200"
                >
                  <RefreshCw size={16} />
                  Refresh Stats
                </button>
              </div>
            </div>

            {/* Import Status */}
            {importStatus && (
              <div
                className={`rounded-2xl p-6 mb-6 ${
                  importStatus.type === "success"
                    ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {importStatus.type === "success" ? (
                    <CheckCircle
                      size={20}
                      className="text-green-600 dark:text-green-400"
                    />
                  ) : (
                    <XCircle
                      size={20}
                      className="text-red-600 dark:text-red-400"
                    />
                  )}
                  <h3
                    className={`font-semibold ${
                      importStatus.type === "success"
                        ? "text-green-800 dark:text-green-200"
                        : "text-red-800 dark:text-red-200"
                    }`}
                  >
                    {importStatus.type === "success"
                      ? "Import Successful"
                      : "Import Failed"}
                  </h3>
                </div>

                <p
                  className={`text-sm ${
                    importStatus.type === "success"
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {importStatus.message}
                </p>

                {importStatus.details && importStatus.type === "success" && (
                  <div className="mt-3 text-sm text-green-700 dark:text-green-300">
                    <p>• Total: {importStatus.details.summary?.total || 0}</p>
                    <p>
                      • Imported: {importStatus.details.summary?.imported || 0}
                    </p>
                    <p>
                      • Updated: {importStatus.details.summary?.updated || 0}
                    </p>
                    {importStatus.details.summary?.errors > 0 && (
                      <p>• Errors: {importStatus.details.summary.errors}</p>
                    )}
                  </div>
                )}

                {importStatus.details && importStatus.type === "error" && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {importStatus.details}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Import Interface */}
          <div className="lg:col-span-2">
            {/* Data Format Example */}
            {showExample && exampleData && (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-black dark:text-white">
                    Data Format Example
                  </h3>
                  <button
                    onClick={loadExampleIntoEditor}
                    className="bg-[#468BFF] hover:bg-[#2563EB] text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200"
                  >
                    Load Example
                  </button>
                </div>

                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <p>
                      <strong>Required fields:</strong>{" "}
                      {exampleData.required_fields?.join(", ")}
                    </p>
                    <p>
                      <strong>Optional fields:</strong>{" "}
                      {exampleData.optional_fields?.join(", ")}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs">
                      {JSON.stringify(exampleData.example_format, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Import Interface */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                  <Upload size={20} />
                  Import Airport Data
                </h3>

                <div className="flex gap-2">
                  <button
                    onClick={clearData}
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    JSON Data (Paste your airport data here)
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your JSON data here... Click 'View Data Format' for the expected structure."
                    rows={16}
                    className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-[#1E1E1E] text-black dark:text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#468BFF] focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {importData.trim()
                      ? `${importData.split("\n").length} lines, ${importData.length} characters`
                      : "No data entered"}
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={isImporting || !importData.trim()}
                    className="flex items-center gap-2 bg-[#468BFF] hover:bg-[#2563EB] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Import Data
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <AlertTriangle
                  size={20}
                  className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-semibold mb-1">Important Notes:</p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • This will update existing airports if ICAO codes match
                    </li>
                    <li>
                      • Runway, frequency, and navigation aid data will be
                      replaced for updated airports
                    </li>
                    <li>
                      • Make sure your JSON format matches the expected
                      structure
                    </li>
                    <li>• Large imports may take a few minutes to complete</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
