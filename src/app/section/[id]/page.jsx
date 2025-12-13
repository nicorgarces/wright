import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { useState } from "react";

export default function SectionBrowser({ params }) {
  const { id } = params;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Mock document data - in a real app this would come from your backend
  const sectionInfo = {
    GEN: {
      title: "General (GEN)",
      description:
        "General rules and procedures, national regulations, aerodrome/heliport directory and air traffic services.",
      documents: [
        {
          id: "gen-1.1",
          title: "GEN 1.1 - Designated Authorities",
          description:
            "Civil aviation authorities and their designated responsibilities",
          lastUpdated: "Nov 21, 2024",
          fileSize: "1.2 MB",
          pages: 15,
          type: "regulation",
        },
        {
          id: "gen-1.2",
          title: "GEN 1.2 - Entry, Transit and Departure",
          description:
            "Procedures for aircraft entry, transit and departure of aircraft",
          lastUpdated: "Nov 21, 2024",
          fileSize: "2.1 MB",
          pages: 28,
          type: "procedure",
        },
        {
          id: "gen-2.1",
          title: "GEN 2.1 - Measuring System, Aircraft Nationality",
          description:
            "Units of measurement and aircraft nationality and registration marks",
          lastUpdated: "Oct 15, 2024",
          fileSize: "0.8 MB",
          pages: 12,
          type: "reference",
        },
      ],
    },
    ENR: {
      title: "En Route (ENR)",
      description:
        "General rules and procedures applicable to en route flight in Colombia's airspace.",
      documents: [
        {
          id: "enr-1.1",
          title: "ENR 1.1 - General Rules and Procedures",
          description: "General rules and procedures applicable to IFR flights",
          lastUpdated: "Nov 21, 2024",
          fileSize: "3.2 MB",
          pages: 42,
          type: "procedure",
        },
        {
          id: "enr-2.1",
          title: "ENR 2.1 - FIR, UIR, TMA",
          description: "Flight Information Regions and Terminal Control Areas",
          lastUpdated: "Nov 21, 2024",
          fileSize: "5.1 MB",
          pages: 67,
          type: "airspace",
        },
      ],
    },
    AD: {
      title: "Aerodromes (AD)",
      description:
        "Aerodrome/heliport information for all public use aerodromes in Colombia.",
      documents: [
        {
          id: "ad-skbo",
          title: "AD 2 SKBO - El Dorado International Airport",
          description: "Complete aerodrome information for Bogotá El Dorado",
          lastUpdated: "Nov 21, 2024",
          fileSize: "4.5 MB",
          pages: 58,
          type: "aerodrome",
        },
        {
          id: "ad-skcl",
          title: "AD 2 SKCL - Alfonso Bonilla Aragón Airport",
          description: "Complete aerodrome information for Cali airport",
          lastUpdated: "Nov 15, 2024",
          fileSize: "3.2 MB",
          pages: 35,
          type: "aerodrome",
        },
      ],
    },
  };

  const currentSection = sectionInfo[id?.toUpperCase()];
  const filteredDocuments =
    currentSection?.documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || doc.type === filterType;
      return matchesSearch && matchesFilter;
    }) || [];

  const getTypeColor = (type) => {
    const colors = {
      regulation:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      procedure:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      reference:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      airspace:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      aerodrome: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return (
      colors[type] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    );
  };

  if (!currentSection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
            Section Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The requested AIP section could not be found.
          </p>
          <a
            href="/"
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1E1E1E] border-b border-[#EAEAEA] dark:border-[#2A2A2A] px-4 sm:px-6 py-6">
        <div className="max-w-[1180px] mx-auto">
          {/* Back button */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-white/90 transition-colors duration-200 mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Sections</span>
          </button>

          {/* Section info */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-4">
              {currentSection.title}
            </h1>
            <p className="text-lg text-[#7A7A7A] dark:text-white/90 max-w-3xl">
              {currentSection.description}
            </p>
          </div>

          {/* Search and filter bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-[#EAEAEA] dark:border-[#3A3A3A] rounded-lg bg-white dark:bg-[#2A2A2A] text-black dark:text-white placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7A7A7A]"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-[#EAEAEA] dark:border-[#3A3A3A] rounded-lg bg-white dark:bg-[#2A2A2A] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Types</option>
                  <option value="regulation">Regulations</option>
                  <option value="procedure">Procedures</option>
                  <option value="reference">References</option>
                  <option value="airspace">Airspace</option>
                  <option value="aerodrome">Aerodromes</option>
                </select>
                <Filter
                  size={20}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#7A7A7A]"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Document list */}
      <main className="px-4 sm:px-6 py-8">
        <div className="max-w-[1180px] mx-auto">
          <div className="grid gap-6">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="bg-white dark:bg-[#1E1E1E] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-lg p-6 hover:shadow-lg dark:hover:shadow-[0_4px_16px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 transition-all duration-200 ease-out"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Document info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#468BFF] to-[#7AB6FF] rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-black dark:text-white leading-tight">
                            {document.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(document.type)}`}
                          >
                            {document.type.charAt(0).toUpperCase() +
                              document.type.slice(1)}
                          </span>
                        </div>
                        <p className="text-[#7A7A7A] dark:text-white/90 mb-4 leading-relaxed">
                          {document.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-[#7A7A7A] dark:text-white/70">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {document.lastUpdated}
                          </span>
                          <span>{document.pages} pages</span>
                          <span>{document.fileSize}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-black dark:text-white border border-[#EAEAEA] dark:border-[#3A3A3A] rounded-lg hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors duration-200">
                      <Download size={16} />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    <a
                      href={`/viewer/${id}/${document.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
                    >
                      <span>View PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText
                  size={48}
                  className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
                />
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  No documents found
                </h3>
                <p className="text-[#7A7A7A] dark:text-white/70">
                  {searchTerm
                    ? "Try adjusting your search terms or filters."
                    : "This section doesn't have any documents yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
