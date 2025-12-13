export function RunwayInfo({ runways }) {
  if (!runways || runways.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 mb-6">
      <h3 className="font-bold text-black dark:text-white mb-4">
        Runways ({runways.length})
      </h3>
      <div className="space-y-3">
        {runways.map((runway, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
          >
            <p className="font-semibold text-black dark:text-white text-sm">
              {runway.designation}
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              {runway.length_m && <p>{runway.length_m}m long</p>}
              {runway.width_m && <p>{runway.width_m}m wide</p>}
              {runway.surface && <p>{runway.surface} surface</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
