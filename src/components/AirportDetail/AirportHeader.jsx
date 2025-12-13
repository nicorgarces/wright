import { ArrowLeft, MapPin, Plane } from "lucide-react";

export function AirportHeader({ airport }) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <a
            href="/airports"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Back to Airports
          </a>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#468BFF] to-[#7AB6FF] flex items-center justify-center">
                <Plane size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  {airport.icao_code}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  {airport.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">
                    {airport.city}, {airport.region}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Type
                </p>
                <p className="font-semibold text-black dark:text-white">
                  {airport.airport_type || "Public"}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Elevation
                </p>
                <p className="font-semibold text-black dark:text-white">
                  {airport.elevation_ft
                    ? `${airport.elevation_ft} ft`
                    : airport.elevation_m
                      ? `${airport.elevation_m} m`
                      : "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Runways
                </p>
                <p className="font-semibold text-black dark:text-white">
                  {airport.runways?.length || 0}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Documents
                </p>
                <p className="font-semibold text-black dark:text-white">
                  {airport.documents?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            {airport.coordinates_text && (
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/${airport.coordinates_text}`,
                    "_blank",
                  )
                }
                className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                <MapPin size={20} />
                View Map
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
