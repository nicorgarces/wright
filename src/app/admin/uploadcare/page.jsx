"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  Key,
  Cloud,
} from "lucide-react";

export default function UploadcareTestPage() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/env-check");
      const data = await response.json();
      setDiagnostics(data.diagnostics);
    } catch (error) {
      console.error("Diagnostics failed:", error);
      setDiagnostics({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/env-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testUpload: true }),
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error("Test upload failed:", error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ condition, className = "" }) => {
    if (condition === true)
      return (
        <CheckCircle size={20} className={`text-green-500 ${className}`} />
      );
    if (condition === false)
      return <XCircle size={20} className={`text-red-500 ${className}`} />;
    return <AlertCircle size={20} className={`text-yellow-500 ${className}`} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#468BFF] to-[#7AB6FF] rounded-xl flex items-center justify-center">
              <Cloud size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                Uploadcare Configuration
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Diagnose and test your CDN upload configuration
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="bg-[#468BFF] hover:bg-[#2563EB] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Key size={20} />
              {loading ? "Checking..." : "Check Environment"}
            </button>

            <button
              onClick={testUpload}
              disabled={
                loading ||
                (diagnostics && !diagnostics.uploadcareStatus?.keyExists)
              }
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Upload size={20} />
              {loading ? "Testing..." : "Test Upload"}
            </button>
          </div>
        </div>

        {/* Diagnostics Results */}
        {diagnostics && (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6 flex items-center gap-2">
              <Key size={20} />
              Environment Diagnostics
            </h2>

            <div className="grid gap-6">
              {/* Uploadcare Status */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <StatusIcon
                    condition={diagnostics.uploadcareStatus?.keyExists}
                  />
                  <h3 className="font-semibold text-black dark:text-white">
                    EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY
                  </h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Key Exists:
                    </span>
                    <span
                      className={
                        diagnostics.uploadcareStatus?.keyExists
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {diagnostics.uploadcareStatus?.keyExists ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Has Value:
                    </span>
                    <span
                      className={
                        diagnostics.uploadcareStatus?.keyHasValue
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {diagnostics.uploadcareStatus?.keyHasValue ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Key Length:
                    </span>
                    <span className="text-black dark:text-white">
                      {diagnostics.uploadcareStatus?.keyLength || 0} characters
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Preview:
                    </span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {diagnostics.uploadcareStatus?.keyPreview}
                    </code>
                  </div>
                </div>
              </div>

              {/* Suggestion */}
              <div
                className={`p-4 rounded-xl border-l-4 ${
                  diagnostics.uploadcareStatus?.keyExists
                    ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200"
                }`}
              >
                <h4 className="font-semibold mb-1">Status:</h4>
                <p>{diagnostics.suggestion}</p>
              </div>

              {/* All Upload Variables */}
              {diagnostics.allUploadVariables &&
                Object.keys(diagnostics.allUploadVariables).length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <h4 className="font-semibold text-black dark:text-white mb-4">
                      All Upload-Related Environment Variables
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(diagnostics.allUploadVariables).map(
                        ([key, info]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <StatusIcon condition={info.exists} />
                              <code className="text-sm">{key}</code>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              {info.hasValue ? `${info.length} chars` : "empty"}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResult && (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6 flex items-center gap-2">
              <Upload size={20} />
              Upload Test Results
            </h2>

            <div
              className={`p-6 rounded-xl border-l-4 ${
                testResult.success
                  ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                  : "bg-red-50 dark:bg-red-900/20 border-red-500"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <StatusIcon condition={testResult.success} />
                <h3
                  className={`font-semibold ${
                    testResult.success
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {testResult.success
                    ? "Upload Successful! 🎉"
                    : "Upload Failed"}
                </h3>
              </div>

              {testResult.success ? (
                <div className="space-y-2 text-green-700 dark:text-green-300">
                  <p>
                    <strong>Message:</strong> {testResult.message}
                  </p>
                  <p>
                    <strong>Test File URL:</strong>
                    <a
                      href={testResult.testFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline ml-2"
                    >
                      {testResult.testFileUrl}
                    </a>
                  </p>
                  <p className="text-sm">
                    ✅ Your Uploadcare configuration is working perfectly!
                  </p>
                  <p className="text-sm">
                    ✅ PDF uploads will now work in the scraper!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-red-700 dark:text-red-300">
                  <p>
                    <strong>Error:</strong> {testResult.error}
                  </p>
                  {testResult.suggestion && (
                    <p>
                      <strong>Suggestion:</strong> {testResult.suggestion}
                    </p>
                  )}
                  {testResult.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer">
                        Show error details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
                        {testResult.details}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        {diagnostics && !diagnostics.uploadcareStatus?.keyExists && (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8 mt-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
              How to Set Up Uploadcare
            </h2>

            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#468BFF] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-black dark:text-white">
                    Create Uploadcare Account
                  </h4>
                  <p>
                    Go to{" "}
                    <a
                      href="https://uploadcare.com"
                      target="_blank"
                      className="text-[#468BFF] underline hover:no-underline"
                    >
                      uploadcare.com
                    </a>{" "}
                    and sign up for a free account
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#468BFF] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-black dark:text-white">
                    Get Your Public Key
                  </h4>
                  <p>
                    In your Uploadcare dashboard, go to API Keys and copy your
                    Public Key
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#468BFF] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-black dark:text-white">
                    Set Environment Variable
                  </h4>
                  <p>
                    The system should automatically set{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY
                    </code>{" "}
                    for you
                  </p>
                  <p className="text-sm mt-1">
                    If it's not working, you may need to configure it in the
                    Anything platform settings
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
