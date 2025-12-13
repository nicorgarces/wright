export function NavigationAidsInfo({ navigationAids }) {
  if (!navigationAids || navigationAids.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6">
      <h3 className="font-bold text-black dark:text-white mb-4">
        Navigation Aids ({navigationAids.length})
      </h3>
      <div className="space-y-3">
        {navigationAids.map((navaid, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-black dark:text-white text-sm">
                  {navaid.nav_type}
                </p>
                {navaid.identifier && (
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {navaid.identifier}
                  </p>
                )}
              </div>
              {navaid.frequency && (
                <span className="font-mono font-semibold text-black dark:text-white text-xs">
                  {navaid.frequency}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
