import { Download, Plus, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  getDocumentTypeIcon,
  getDocumentTypeColor,
  getDocumentCategory,
} from "@/utils/documentHelpers";

export function DocumentList({
  documents,
  selectedDocument,
  onDocumentSelect,
  onDownload,
  onToggleUpload,
}) {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Group documents by category
  const groupedDocuments = {};
  if (documents && documents.length > 0) {
    documents.forEach((doc) => {
      const category = getDocumentCategory(doc.document_type);
      if (!groupedDocuments[category]) {
        groupedDocuments[category] = [];
      }
      groupedDocuments[category].push(doc);
    });
  }

  // Sort categories by priority
  const categoryOrder = [
    "Basic Information",
    "Operations",
    "Runways",
    "Safety",
    "Ground Movement",
    "Lighting & Navigation",
    "Weather",
    "Services",
    "Complete Documents",
    "Other Documents",
    "Other",
  ];

  const sortedCategories = Object.keys(groupedDocuments).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-black dark:text-white">
          Documents ({documents?.length || 0})
        </h2>
        <div className="flex gap-2">
          {selectedDocument && (
            <button
              onClick={onDownload}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="Download current document"
            >
              <Download
                size={16}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
          )}
          <button
            onClick={onToggleUpload}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            title="Upload new document"
          >
            <Plus size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {documents && documents.length > 0 ? (
        <div className="space-y-4">
          {sortedCategories.map((category) => {
            const categoryDocs = groupedDocuments[category];
            const isExpanded = expandedCategories.has(category);

            return (
              <div
                key={category}
                className="border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-black dark:text-white">
                      📁 {category}
                    </div>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                      {categoryDocs.length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  )}
                </button>

                {/* Category Documents */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {categoryDocs.map((doc) => {
                      const IconComponent = getDocumentTypeIcon(
                        doc.document_type,
                      );
                      return (
                        <button
                          key={doc.id}
                          onClick={() => onDocumentSelect(doc)}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                            selectedDocument?.id === doc.id
                              ? "bg-[#468BFF] text-white"
                              : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <IconComponent
                              size={16}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm truncate">
                                  {doc.title}
                                </p>
                                {doc.is_primary && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 flex-shrink-0">
                                    Primary
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${getDocumentTypeColor(doc.document_type)}`}
                                >
                                  {doc.document_type}
                                </span>
                                <span className="text-xs opacity-75">
                                  {doc.file_type?.toUpperCase() || "PDF"}
                                </span>
                              </div>
                              {doc.description && (
                                <p className="text-xs opacity-75 mt-1 line-clamp-2">
                                  {doc.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No documents uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}
