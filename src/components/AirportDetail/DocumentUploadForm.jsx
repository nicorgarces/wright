import { AlertCircle } from "lucide-react";

export function DocumentUploadForm({
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
  onFileSelect,
  onUpload,
  onCancel,
}) {
  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <h3 className="font-semibold text-black dark:text-white mb-4">
        Upload New Document
      </h3>

      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300 text-sm">
              {uploadError}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            File (PDF recommended)
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => onFileSelect(e.target.files[0])}
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
          />
          {uploadFile && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {uploadFile.name} (
              {Math.round((uploadFile.size / 1024 / 1024) * 100) / 100} MB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            placeholder="e.g., Approach Chart RWY 06"
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
          >
            <option value="chart">Chart</option>
            <option value="approach">Approach</option>
            <option value="departure">Departure</option>
            <option value="procedure">Procedure</option>
            <option value="general">General</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            placeholder="Brief description of the document..."
            rows={2}
            className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPrimary"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="rounded"
          />
          <label
            htmlFor="isPrimary"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Set as primary document
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onUpload}
            disabled={uploading || !uploadFile}
            className="flex-1 bg-[#468BFF] hover:bg-[#2563EB] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
