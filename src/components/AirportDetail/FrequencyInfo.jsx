export function FrequencyInfo({ frequencies }) {
  if (!frequencies || frequencies.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 mb-6">
      <h3 className="font-bold text-black dark:text-white mb-4">
        Radio Frequencies ({frequencies.length})
      </h3>
      <div className="space-y-3">
        {frequencies.map((freq, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {freq.service_name}
            </span>
            <span className="font-mono font-semibold text-black dark:text-white text-sm">
              {freq.frequency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
