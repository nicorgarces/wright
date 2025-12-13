import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Plus,
  MapPin,
  Plane,
  AlertCircle,
  CheckCircle,
  X,
  ExternalLink,
  TestTube,
} from "lucide-react";
import Header from "../../../components/Header";

export default function AdminDocumentsPage() {
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [diagnosticMode, setDiagnosticMode] = useState(false);

  // Upload form state
  const [uploadData, setUploadData] = useState({
    file: null,
    title: "",
    document_type: "chart",
    description: "",
    is_primary: false,
    effective_date: "",
  });

  useEffect(() => {
    loadAirports();
  }, []);

  useEffect(() => {
    loadAirports();
  }, [searchQuery]);

  useEffect(() => {
    if (selectedAirport) {
      loadDocuments(selectedAirport.icao_code);
    }
  }, [selectedAirport]);

  const loadAirports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "500",
        search: searchQuery,
      });

      const response = await fetch(`/api/airports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAirports(data.airports);
      }
    } catch (error) {
      console.error("Error loading airports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async (icao) => {
    try {
      const response = await fetch(`/api/airports/${icao}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    }
  };

  const handleAirportSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!uploadData.file || !selectedAirport) {
      setUploadStatus({
        type: "error",
        message: "Please select a file and airport",
      });
      return;
    }

    setIsLoading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("title", uploadData.title || uploadData.file.name);
      formData.append("document_type", uploadData.document_type);
      formData.append("description", uploadData.description);
      formData.append("is_primary", uploadData.is_primary);
      if (uploadData.effective_date) {
        formData.append("effective_date", uploadData.effective_date);
      }

      const response = await fetch(
        `/api/airports/${selectedAirport.icao_code}/documents`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      setUploadStatus({
        type: "success",
        message: "Document uploaded successfully!",
      });

      // Refresh documents list
      loadDocuments(selectedAirport.icao_code);

      // Reset form
      setUploadData({
        file: null,
        title: "",
        document_type: "chart",
        description: "",
        is_primary: false,
        effective_date: "",
      });

      // Close modal after a delay
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case "chart":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200";
      case "approach":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "departure":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200";
      case "procedure":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case "chart":
        return MapPin;
      case "approach":
      case "departure":
      case "procedure":
        return Plane;
      default:
        return FileText;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // URL Testing functionality
  const testUrlAccess = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD", mode: "cors" });
      return { success: response.ok, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const TestUrlButton = ({ url }) => {
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);

    const handleTest = async () => {
      setTesting(true);
      const result = await testUrlAccess(url);
      setTestResult(result);
      setTesting(false);
    };

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleTest}
          disabled={testing}
          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors disabled:opacity-50"
        >
          {testing ? "Testing..." : "Test URL"}
        </button>
        {testResult && (
          <span
            className={`text-xs flex items-center gap-1 ${testResult.success ? "text-green-600" : "text-red-600"}`}
          >
            {testResult.success ? (
              <CheckCircle size={12} />
            ) : (
              <AlertCircle size={12} />
            )}
            {testResult.success
              ? `✓ ${testResult.status}`
              : `✗ ${testResult.error || testResult.status}`}
          </span>
        )}
      </div>
    );
  };

  // Filter airports based on search
  const filteredAirports = airports.filter(
    (airport) =>
      airport.icao_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      airport.city.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <Header />

      {/* Page Header */}
      <div className="bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Document Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Upload and manage airport documents, charts, and procedures
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Airport Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 sticky top-8">
              <h2 className="text-lg font-bold text-black dark:text-white mb-4">
                Select Airport
              </h2>

              {/* Search */}
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleAirportSearch(e.target.value)}
                  placeholder="Search airports..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1E1E] text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#468BFF] focus:border-transparent"
                />
              </div>

              {/* Airport List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-[#468BFF] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading airports...</p>
                  </div>
                ) : (
                  filteredAirports.map((airport) => (
                    <button
                      key={airport.id}
                      onClick={() => setSelectedAirport(airport)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        selectedAirport?.id === airport.id
                          ? "bg-[#468BFF] text-white"
                          : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#468BFF] to-[#7AB6FF] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Plane size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {airport.icao_code}
                          </p>
                          <p className="text-xs opacity-75 truncate">
                            {airport.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}

                {!isLoading && filteredAirports.length === 0 && (
                  <div className="text-center py-8">
                    <Search size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500 text-sm">No airports found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Documents */}
          <div className="lg:col-span-2">
            {selectedAirport ? (
              <div className="space-y-6">
                {/* Airport Header */}
                <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-black dark:text-white">
                        {selectedAirport.icao_code} - {selectedAirport.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedAirport.city}, {selectedAirport.region}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Diagnostic Mode Toggle */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="diagnosticMode"
                          checked={diagnosticMode}
                          onChange={(e) => setDiagnosticMode(e.target.checked)}
                          className="w-4 h-4 text-[#468BFF] border-gray-300 rounded focus:ring-[#468BFF]"
                        />
                        <label
                          htmlFor="diagnosticMode"
                          className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1"
                        >
                          <TestTube size={14} />
                          Diagnostic Mode
                        </label>
                      </div>

                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-[#468BFF] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Upload Document
                      </button>
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                    Documents ({documents.length})
                  </h3>

                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => {
                        const IconComponent = getDocumentTypeIcon(
                          doc.document_type,
                        );
                        return (
                          <div
                            key={doc.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-[#468BFF] transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <IconComponent size={20} className="mt-1" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-black dark:text-white truncate">
                                      {doc.title}
                                    </h4>
                                    {doc.is_primary && (
                                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                        Primary
                                      </span>
                                    )}
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${getDocumentTypeColor(doc.document_type)}`}
                                    >
                                      {doc.document_type}
                                    </span>
                                  </div>

                                  {doc.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                      {doc.description}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span>
                                      {doc.file_type?.toUpperCase() || "PDF"}
                                    </span>
                                    {doc.file_size && (
                                      <span>
                                        {formatFileSize(doc.file_size)}
                                      </span>
                                    )}
                                    {doc.effective_date && (
                                      <span>
                                        Effective: {doc.effective_date}
                                      </span>
                                    )}
                                    <span>
                                      Uploaded:{" "}
                                      {new Date(
                                        doc.created_at,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {/* Diagnostic info in diagnostic mode */}
                                  {diagnosticMode && (
                                    <div className="mt-3 space-y-2">
                                      <div className="text-xs">
                                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                                          URL:
                                        </span>
                                        <code className="ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs break-all">
                                          {doc.file_url}
                                        </code>
                                        {doc.file_url.includes(
                                          "ucarecdn.com",
                                        ) && (
                                          <span className="ml-2 text-orange-600 dark:text-orange-400 text-xs">
                                            ⚠️ CDN URL
                                          </span>
                                        )}
                                      </div>
                                      <TestUrlButton url={doc.file_url} />
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() =>
                                    window.open(
                                      `/airport/${selectedAirport.icao_code.toLowerCase()}`,
                                      "_blank",
                                    )
                                  }
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                  title="View in airport page"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    window.open(doc.file_url, "_blank")
                                  }
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                  title="Download document"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <h4 className="text-lg font-semibold text-black dark:text-white mb-2">
                        No Documents Yet
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Upload the first document for this airport to get
                        started.
                      </p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-[#468BFF] hover:bg-[#2563EB] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 inline-flex items-center gap-2"
                      >
                        <Upload size={18} />
                        Upload First Document
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* No Airport Selected */
              <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                  <MapPin size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                  Select an Airport
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose an airport from the sidebar to view and manage its
                  documents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-black dark:text-white">
                Upload Document
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadStatus(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File *
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file: e.target.files[0] })
                  }
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1E1E] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#468BFF] focus:border-transparent"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, title: e.target.value })
                  }
                  placeholder="Enter document title (or leave blank to use filename)"
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1E1E] text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#468BFF] focus:border-transparent"
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type *
                </label>
                <select
                  value={uploadData.document_type}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      document_type: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1E1E] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#468BFF] focus:border-transparent"
                  required
                >
                  <option value="chart">Airport Chart</option>
                  <option value="approach">Approach Procedure</option>
                  <option value="departure">Departure Procedure</option>
                  <option value="procedure">General Procedure</option>
                  <option value="general">General Document</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional description of the document"
                  rows={3}
                  className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1E1E1E] text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#468BFF] focus:border-transparent resize-none"
                />
              </div>

              {/* Primary Document */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={uploadData.is_primary}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      is_primary: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-[#468BFF] border-gray-300 rounded focus:ring-[#468BFF]"
                />
                <label
                  htmlFor="is_primary"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Set as primary document (shown first)
                </label>
              </div>

              {/* Status Message */}
              {uploadStatus && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    uploadStatus.type === "success"
                      ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                  }`}
                >
                  {uploadStatus.type === "success" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span className="text-sm">{uploadStatus.message}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadStatus(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !uploadData.file}
                  className="flex-1 bg-[#468BFF] hover:bg-[#2563EB] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
