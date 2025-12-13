import {
  ArrowLeft,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function DocumentViewer({ params }) {
  const { section, document } = params;
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock document data - in a real app this would come from your backend
  const documentInfo = {
    title: `${section.toUpperCase()} - ${document.charAt(0).toUpperCase() + document.slice(1)}`,
    description: "Colombian Aeronautical Information Publication",
    lastUpdated: "November 21, 2024",
    fileSize: "2.4 MB",
    pages: 45,
    // For demo purposes, using a sample PDF URL
    pdfUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = documentInfo.pdfUrl;
    link.download = `${documentInfo.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-[#1E1E1E] border-b border-[#EAEAEA] dark:border-[#2A2A2A] px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section - Back button and document info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-white/90 transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-black dark:text-white">
                {documentInfo.title}
              </h1>
              <p className="text-sm text-[#7A7A7A] dark:text-white/70">
                {documentInfo.description}
              </p>
            </div>
          </div>

          {/* Right section - Controls */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search in document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-3 py-2 pl-10 border border-[#EAEAEA] dark:border-[#3A3A3A] rounded-lg bg-white dark:bg-[#2A2A2A] text-black dark:text-white placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7A7A7A]"
                />
              </div>
            </form>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 text-sm"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E1E1E] border-b border-[#EAEAEA] dark:border-[#2A2A2A] px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Document info */}
          <div className="flex items-center gap-4 text-sm text-[#7A7A7A] dark:text-white/70">
            <span>{documentInfo.pages} pages</span>
            <span>•</span>
            <span>{documentInfo.fileSize}</span>
            <span>•</span>
            <span>Updated: {documentInfo.lastUpdated}</span>
          </div>

          {/* Right - Zoom and rotation controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded transition-colors duration-200"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-sm text-black dark:text-white px-3 min-w-[60px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded transition-colors duration-200"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <div className="w-px h-6 bg-[#EAEAEA] dark:bg-[#3A3A3A] mx-2"></div>
            <button
              onClick={handleRotate}
              className="p-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded transition-colors duration-200"
              title="Rotate"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 p-4 flex justify-center items-center">
        <div
          className="w-full max-w-4xl bg-white dark:bg-[#2A2A2A] rounded-lg shadow-lg overflow-hidden"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          {/* PDF iframe - In a real app, you'd use a proper PDF viewer library */}
          <iframe
            src={documentInfo.pdfUrl}
            className="w-full h-[800px]"
            title={documentInfo.title}
          />
        </div>
      </div>

      {/* Mobile search overlay */}
      <div className="lg:hidden fixed bottom-4 right-4">
        <button className="bg-black dark:bg-white text-white dark:text-black p-3 rounded-full shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200">
          <Search size={20} />
        </button>
      </div>
    </div>
  );
}
