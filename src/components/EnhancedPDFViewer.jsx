import { useState, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  Download,
  ExternalLink,
  RotateCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function EnhancedPDFViewer({
  pdfUrl,
  documentTitle,
  airportIcao,
}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfData, setPdfData] = useState(null);
  const [viewMode, setViewMode] = useState("embed"); // 'embed' or 'object' or 'download'

  // Try to detect if URL is from a CDN that might have embedding issues
  const isCDNUrl =
    pdfUrl &&
    (pdfUrl.includes("ucarecdn.com") ||
      pdfUrl.includes("amazonaws.com") ||
      pdfUrl.includes("googleapis.com") ||
      pdfUrl.includes("cloudflare.com"));

  // Enhanced PDF loading with fallback strategies
  useEffect(() => {
    if (!pdfUrl) {
      setError("No PDF URL provided");
      setIsLoading(false);
      return;
    }

    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setLoadProgress(10);

        // First, try to fetch the PDF to check if it's accessible
        console.log(`[PDF_VIEWER] Attempting to load PDF: ${pdfUrl}`);

        const response = await fetch(pdfUrl, {
          method: "HEAD",
          mode: "cors",
          headers: {
            Accept: "application/pdf,*/*",
          },
        });

        setLoadProgress(50);

        if (!response.ok) {
          throw new Error(
            `PDF not accessible: ${response.status} ${response.statusText}`,
          );
        }

        const contentType = response.headers.get("content-type");
        console.log(`[PDF_VIEWER] Content-Type: ${contentType}`);

        if (!contentType || !contentType.includes("pdf")) {
          console.warn(`[PDF_VIEWER] Unexpected content type: ${contentType}`);
        }

        setLoadProgress(90);

        // If it's a CDN URL, prefer direct download/opening
        if (isCDNUrl) {
          console.log(
            `[PDF_VIEWER] CDN URL detected, using direct display method`,
          );
          setViewMode("object");
        }

        setLoadProgress(100);
        setIsLoading(false);
      } catch (error) {
        console.error(`[PDF_VIEWER] Failed to load PDF:`, error);
        setError(`Unable to load PDF: ${error.message}`);
        setIsLoading(false);
        setViewMode("download");
      }
    };

    loadPDF();
  }, [pdfUrl, isCDNUrl]);

  // Progress bar simulation
  useEffect(() => {
    if (isLoading && loadProgress < 90) {
      const progressInterval = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 5;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    }
  }, [isLoading, loadProgress]);

  const handleIframeLoad = () => {
    console.log(`[PDF_VIEWER] Iframe loaded successfully`);
    setIsLoading(false);
    setLoadProgress(100);
    setError(null);
  };

  const handleIframeError = () => {
    console.error(`[PDF_VIEWER] Iframe failed to load`);
    setError(
      "PDF cannot be embedded. Click 'Open in New Tab' to view the document.",
    );
    setIsLoading(false);
    setViewMode("download");
  };

  const handleObjectError = () => {
    console.error(`[PDF_VIEWER] Object/embed failed to load`);
    setError(
      "PDF embedding failed. The document can be downloaded or opened in a new tab.",
    );
    setViewMode("download");
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    console.log(`[PDF_VIEWER] Opening PDF in new tab: ${pdfUrl}`);
    window.open(pdfUrl, "_blank");
  };

  const handleOpenExternal = () => {
    window.open(pdfUrl, "_blank");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  const renderPDFContent = () => {
    if (!pdfUrl) {
      return (
        <div className="w-full h-full bg-white border border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium">No PDF URL provided</p>
            <p className="text-sm">Please check the document source</p>
          </div>
        </div>
      );
    }

    // Show download-only mode if embedding failed
    if (viewMode === "download" || error) {
      return (
        <div className="w-full h-full bg-white border border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500 max-w-md px-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink
                size={32}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              {error ? "Embedding Not Supported" : "PDF Ready to View"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              {error ||
                "This PDF is hosted on a CDN and needs to be opened directly."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleOpenExternal}
                className="bg-[#468BFF] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Open PDF in New Tab
              </button>
              <button
                onClick={handleDownload}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              💡 Tip: Right-click the "Open PDF" button and select "Open in new
              tab"
            </p>
          </div>
        </div>
      );
    }

    // Try object/embed approach for better CDN compatibility
    if (viewMode === "object") {
      return (
        <div className="w-full h-full bg-gray-100">
          <object
            data={pdfUrl}
            type="application/pdf"
            className={`w-full h-full ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
            onLoad={handleIframeLoad}
            onError={handleObjectError}
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
            }}
          >
            <embed
              src={pdfUrl}
              type="application/pdf"
              className="w-full h-full"
              onError={handleObjectError}
            />
            {/* Fallback if object/embed fails */}
            <div className="w-full h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Your browser doesn't support embedded PDFs.
                </p>
                <button
                  onClick={handleOpenExternal}
                  className="bg-[#468BFF] hover:bg-[#2563EB] text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Open PDF in New Tab
                </button>
              </div>
            </div>
          </object>
        </div>
      );
    }

    // Default iframe approach (fallback)
    return (
      <iframe
        src={`${pdfUrl}${pdfUrl.includes("#") ? "&" : "#"}toolbar=0&navpanes=0&scrollbar=1&page=${currentPage}`}
        className={`w-full h-full border-0 ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        title={documentTitle}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top center",
        }}
      />
    );
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-lg">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 p-4">
        {/* Loading Progress Bar */}
        {isLoading && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#468BFF] transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              Loading aviation chart... {loadProgress}%
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Document Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-black dark:text-white text-lg">
              {documentTitle}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {airportIcao} • Page {currentPage} of {totalPages}
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={16}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in document..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1E1E] text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#468BFF] focus:border-transparent"
              />
            </div>
          </form>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Page Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="p-2 rounded-lg bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ZoomOut size={16} />
              </button>
              <span className="px-2 py-1 text-xs font-mono bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-600 rounded text-center min-w-[50px]">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                className="p-2 rounded-lg bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Download PDF"
              >
                <Download size={16} />
              </button>
              <button
                onClick={handleOpenExternal}
                className="p-2 rounded-lg bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Open in new tab"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Area */}
      <div
        className="relative bg-gray-100 dark:bg-gray-900"
        style={{ height: "70vh" }}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#1E1E1E] bg-opacity-90 dark:bg-opacity-90 z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#468BFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700 dark:text-gray-200 font-medium mb-1">
                Loading aviation chart...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This may take a moment for large files
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#1E1E1E] z-10">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink
                  size={32}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                Unable to Load Chart
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    setLoadProgress(0);
                  }}
                  className="bg-[#468BFF] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Retry
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Embed - Optimized for performance */}
        <div className="w-full h-full overflow-auto">
          <div className="flex justify-center p-4">
            <div
              className="bg-white shadow-lg"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                minHeight: "100%",
              }}
            >
              {renderPDFContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
            <span>Document: {documentTitle}</span>
            <span>•</span>
            <span>Zoom: {zoomLevel}%</span>
            <span>•</span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            {!isLoading && !error && (
              <>
                <span>•</span>
                <span className="text-green-600 dark:text-green-400">
                  ✓ Loaded from CDN
                </span>
              </>
            )}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Source: Aerocivil Colombia
          </div>
        </div>
      </div>
    </div>
  );
}
