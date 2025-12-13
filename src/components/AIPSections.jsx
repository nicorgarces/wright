import {
  ArrowUpRight,
  BookOpen,
  Map,
  Plane,
  Radio,
  Calendar,
} from "lucide-react";

export default function AIPSections() {
  const sections = [
    {
      id: "GEN",
      title: "General (GEN)",
      description:
        "General rules and procedures, national regulations, aerodrome/heliport directory and air traffic services.",
      lastUpdated: "Nov 21, 2024",
      icon: BookOpen,
      gradient: "from-[#468BFF] to-[#7AB6FF]",
      documentsCount: 15,
    },
    {
      id: "ENR",
      title: "En Route (ENR)",
      description:
        "General rules and procedures applicable to en route flight in Colombia's airspace.",
      lastUpdated: "Nov 21, 2024",
      icon: Map,
      gradient: "from-[#FF7A00] to-[#FFC287]",
      documentsCount: 22,
    },
    {
      id: "AD",
      title: "Aerodromes (AD)",
      description:
        "Aerodrome/heliport information for all public use aerodromes in Colombia.",
      lastUpdated: "Nov 21, 2024",
      icon: Plane,
      gradient: "from-[#B83AE0] to-[#DF9EFF]",
      documentsCount: 48,
    },
  ];

  const quickAccess = [
    {
      id: "amendments",
      title: "Latest Amendments",
      description: "View all recent changes and supplements to the AIP.",
      icon: Calendar,
      gradient: "from-[#10B981] to-[#6EE7B7]",
    },
    {
      id: "navaids",
      title: "Navigation Aids",
      description:
        "Complete listing of navigation aids and their characteristics.",
      icon: Radio,
      gradient: "from-[#EF4444] to-[#FCA5A5]",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#121212]">
      {/* Main AIP Sections */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1180px] mx-auto">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
            <h2 className="text-[clamp(24px,4vw,44px)] font-medium text-black dark:text-white leading-tight mb-4 sm:mb-0">
              AIP Sections
            </h2>
            <a
              href="/search"
              className="flex items-center gap-1 text-black dark:text-white font-semibold text-sm sm:text-base hover:underline active:opacity-80 transition-all duration-200 group self-start sm:self-auto"
            >
              <span>Advanced Search</span>
              <ArrowUpRight
                size={16}
                className="transition-transform duration-200 group-hover:rotate-45"
              />
            </a>
          </div>

          {/* Card Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <div
                  key={section.id}
                  className="bg-white dark:bg-[#1E1E1E] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-[20px] p-6 sm:p-8 lg:p-9 shadow-[0_4px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.05)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_16px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 transition-all duration-200 ease-out"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    {/* Section Icon + Title group */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shrink-0`}
                      >
                        <IconComponent
                          size={20}
                          className="text-white sm:w-6 sm:h-6"
                        />
                      </div>
                      <h3 className="text-lg sm:text-[22px] font-medium text-black dark:text-white leading-tight min-w-0">
                        {section.title}
                      </h3>
                    </div>

                    {/* Document count */}
                    <div className="shrink-0 ml-4">
                      <span className="bg-gray-100 dark:bg-[#2A2A2A] text-black dark:text-white text-xs px-2 py-1 rounded-full font-medium">
                        {section.documentsCount} docs
                      </span>
                    </div>
                  </div>

                  {/* Body Copy */}
                  <p className="text-black dark:text-white/90 text-opacity-85 text-sm sm:text-base leading-relaxed mb-4">
                    {section.description}
                  </p>

                  {/* Last updated */}
                  <p className="text-[#7A7A7A] dark:text-white/70 text-xs mb-6 sm:mb-8">
                    Last updated: {section.lastUpdated}
                  </p>

                  {/* Divider */}
                  <hr className="border-[#E8E8E8] dark:border-[#3A3A3A] mb-6 sm:mb-8" />

                  {/* Footer Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                    <a
                      href={`/section/${section.id.toLowerCase()}`}
                      className="text-black dark:text-white font-semibold text-sm sm:text-base hover:underline active:opacity-80 transition-all duration-200 order-2 sm:order-1"
                    >
                      Browse Documents
                    </a>
                    <a
                      href={`/viewer/${section.id.toLowerCase()}/overview`}
                      className="bg-black dark:bg-white text-white dark:text-black px-6 sm:px-8 py-3 rounded-full font-medium text-sm sm:text-base hover:bg-[#333333] dark:hover:bg-[#E0E0E0] active:bg-[#1a1a1a] dark:active:bg-[#C0C0C0] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-40 group order-1 sm:order-2"
                    >
                      <span className="flex items-center gap-2">
                        View
                        <ArrowUpRight
                          size={16}
                          className="transition-transform duration-200 group-hover:rotate-45"
                        />
                      </span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="bg-gray-50 dark:bg-[#1A1A1A] px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-[1180px] mx-auto">
          <h2 className="text-[clamp(24px,4vw,32px)] font-medium text-black dark:text-white leading-tight mb-8 sm:mb-12 text-center">
            Quick Access
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {quickAccess.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#1E1E1E] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-[20px] p-6 sm:p-8 shadow-[0_4px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.05)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_16px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 transition-all duration-200 ease-out"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}
                    >
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-[#7A7A7A] dark:text-white/70 text-sm leading-relaxed mb-4">
                        {item.description}
                      </p>
                      <a
                        href={`/${item.id}`}
                        className="inline-flex items-center gap-1 text-black dark:text-white font-semibold text-sm hover:underline active:opacity-80 transition-all duration-200"
                      >
                        <span>Access</span>
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
