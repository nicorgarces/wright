import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useAirportData } from "@/hooks/useAirportData";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { AirportHeader } from "@/components/AirportDetail/AirportHeader";
import { DocumentList } from "@/components/AirportDetail/DocumentList";
import { DocumentUploadForm } from "@/components/AirportDetail/DocumentUploadForm";
import { RunwayInfo } from "@/components/AirportDetail/RunwayInfo";
import { FrequencyInfo } from "@/components/AirportDetail/FrequencyInfo";
import { NavigationAidsInfo } from "@/components/AirportDetail/NavigationAidsInfo";
import { DocumentViewer } from "@/components/AirportDetail/DocumentViewer";
import { LoadingState } from "@/components/AirportDetail/LoadingState";
import { ErrorState } from "@/components/AirportDetail/ErrorState";
import { UploadSuccessNotification } from "@/components/AirportDetail/UploadSuccessNotification";

export default function AirportDetailPage({ params }) {
  const { icao } = params;
  const { airport, isLoading, error, reload } = useAirportData(icao);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const uploadHook = useDocumentUpload(icao, async (newDocument) => {
    setUploadSuccess(true);
    setShowUpload(false);
    await reload();
    if (newDocument) {
      setSelectedDocument(newDocument);
    }
  });

  useEffect(() => {
    if (airport?.documents && airport.documents.length > 0) {
      const primaryDoc = airport.documents.find((doc) => doc.is_primary);
      setSelectedDocument(primaryDoc || airport.documents[0]);
    }
  }, [airport]);

  const handleToggleUpload = () => {
    setShowUpload(!showUpload);
  };

  const handleCancelUpload = () => {
    setShowUpload(false);
    uploadHook.resetForm();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !airport) {
    return <ErrorState error={error} icao={icao} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <Header />

      {uploadSuccess && (
        <UploadSuccessNotification onClose={() => setUploadSuccess(false)} />
      )}

      <AirportHeader airport={airport} />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <DocumentList
              documents={airport.documents}
              selectedDocument={selectedDocument}
              onDocumentSelect={setSelectedDocument}
              onDownload={() =>
                window.open(selectedDocument.file_url, "_blank")
              }
              onToggleUpload={handleToggleUpload}
            />

            {showUpload && (
              <DocumentUploadForm
                uploadFile={uploadHook.uploadFile}
                uploadTitle={uploadHook.uploadTitle}
                setUploadTitle={uploadHook.setUploadTitle}
                uploadType={uploadHook.uploadType}
                setUploadType={uploadHook.setUploadType}
                uploadDescription={uploadHook.uploadDescription}
                setUploadDescription={uploadHook.setUploadDescription}
                isPrimary={uploadHook.isPrimary}
                setIsPrimary={uploadHook.setIsPrimary}
                uploadError={uploadHook.uploadError}
                uploading={uploadHook.uploading}
                onFileSelect={uploadHook.handleFileSelect}
                onUpload={uploadHook.handleUpload}
                onCancel={handleCancelUpload}
              />
            )}

            <RunwayInfo runways={airport.runways} />
            <FrequencyInfo frequencies={airport.frequencies} />
            <NavigationAidsInfo navigationAids={airport.navigation_aids} />
          </div>

          <div className="lg:col-span-3">
            <DocumentViewer
              selectedDocument={selectedDocument}
              airport={airport}
              onUploadClick={() => setShowUpload(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
