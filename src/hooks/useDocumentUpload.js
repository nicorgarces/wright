import { useState } from "react";

export function useDocumentUpload(icao, onSuccess) {
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("chart");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Check initial file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setUploadError(
        `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 50MB. Please compress the PDF before uploading.`,
      );
      return;
    }

    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadError("Please select a file to upload");
      return;
    }

    if (!uploadTitle.trim()) {
      setUploadError("Please enter a title for the document");
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle.trim());
      formData.append("document_type", uploadType);
      formData.append("description", uploadDescription.trim());
      formData.append("is_primary", isPrimary.toString());

      // Upload to backend
      const response = await fetch(`/api/airports/${icao}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to upload document");
      }

      const result = await response.json();

      resetForm();

      if (onSuccess) {
        onSuccess(result.document);
      }

      return result.document;
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload document");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setIsPrimary(false);
    setUploadError(null);
  };

  return {
    uploadFile,
    uploadTitle,
    setUploadTitle,
    uploadType,
    setUploadType,
    uploadDescription,
    setUploadDescription,
    isPrimary,
    setIsPrimary,
    uploadError,
    uploading,
    handleFileSelect,
    handleUpload,
    resetForm,
  };
}
