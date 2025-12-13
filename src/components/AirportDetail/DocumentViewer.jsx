import { FileText, Upload } from "lucide-react";
import EnhancedPDFViewer from "@/components/EnhancedPDFViewer";

export function DocumentViewer({ selectedDocument, airport, onUploadClick }) {
  if (selectedDocument) {
    return (
      <EnhancedPDFViewer
        pdfUrl={selectedDocument.file_url}
        documentTitle={selectedDocument.title}
        airportIcao={airport.icao_code}
      />
    );
  }

  if (airport.documents && airport.documents.length > 0) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#468BFF] to-[#7AB6FF] rounded-full flex items-center justify-center mb-4">
          <FileText size={32} className="text-white" />
        </div>
        <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
          Select a Document
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Choose a document from the sidebar to view it here. We have{" "}
          {airport.documents.length} documents available for {airport.name}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8 text-center">
      <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <Upload size={32} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibled text-black dark:text-white mb-2">
        No Documents Available
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        There are currently no documents uploaded for {airport.name}. Documents
        like airport charts, approach procedures, and departure procedures will
        appear here when available.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onUploadClick}
          className="bg-[#468BFF] hover:bg-[#2563EB] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 inline-flex items-center gap-2"
        >
          <Upload size={20} />
          Upload Document
        </button>
      </div>
    </div>
  );
}
