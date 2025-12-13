import { CheckCircle, X } from "lucide-react";

export function UploadSuccessNotification({ onClose }) {
  return (
    <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
        <div className="flex items-center">
          <CheckCircle size={20} className="text-green-500 mr-3" />
          <p className="text-green-700 dark:text-green-300">
            Document uploaded successfully!
          </p>
          <button
            onClick={onClose}
            className="ml-auto text-green-700 hover:text-green-900 dark:text-green-300"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
