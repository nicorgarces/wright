import { ArrowLeft, Plane } from "lucide-react";
import Header from "@/components/Header";

export function ErrorState({ error, icao }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <Header />
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-12">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <Plane size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            {error === "Airport not found"
              ? "Airport Not Found"
              : "Error Loading Airport"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error === "Airport not found"
              ? `Airport with ICAO code "${icao.toUpperCase()}" was not found in our database.`
              : error ||
                "Something went wrong while loading the airport information."}
          </p>
          <a
            href="/airports"
            className="inline-flex items-center gap-2 bg-[#468BFF] hover:bg-[#2563EB] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Back to Airports
          </a>
        </div>
      </div>
    </div>
  );
}
