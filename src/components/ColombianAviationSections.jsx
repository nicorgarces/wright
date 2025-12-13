import {
  ArrowUpRight,
  Plane,
  Search,
  Bell,
  MessageCircle,
  FileText,
  MapPin,
  Clock,
  Bot,
} from "lucide-react";
import { useState } from "react";
import useLanguage from "../utils/useLanguage";
import { t } from "../utils/translations";

export default function ColombianAviationSections() {
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();

  const mainFeatures = [
    {
      id: "airport-search",
      titleKey: "home.airportSearch.title",
      descriptionKey: "home.airportSearch.description",
      statusKey: "home.airportSearch.status",
      actionKey: "home.airportSearch.action",
      icon: Plane,
      gradient: "from-[#1E3A8A] to-[#3B82F6]", // Navy blue gradient
      link: "/airports",
    },
    {
      id: "notam",
      titleKey: "home.notam.title",
      descriptionKey: "home.notam.description",
      statusKey: "home.notam.status",
      actionKey: "home.notam.action",
      icon: Bell,
      gradient: "from-[#c4c284] to-[#dcc39c]", // Sandy/beige gradient from new palette
      link: "/notam",
    },
    {
      id: "Pricing",
      titleKey: "home.pricing.title",
      descriptionKey: "home.pricing.description",
      statusKey: "home.pricing.status",
      actionKey: "home.pricing.action",
      icon: FileText,
      gradient: "from-[#949484] to-[#c4c284]", // Gray/sage to sandy gradient from new palette
      link: "/pricing",
    },
    {
      id: "raci-ai",
      titleKey: "home.racAi.title",
      descriptionKey: "home.racAi.description",
      statusKey: "home.racAi.status",
      actionKey: "home.racAi.action",
      icon: Bot,
      gradient: "from-[#949484] to-[#c4c284]", // Gray/sage to sandy gradient from new palette
      link: "/rac-ai",
    },
  ];

  const quickAccess = [
    {
      id: "skbo",
      title: "SKBO - El Dorado",
      code: "SKBO",
      city: "Bogotá",
      icon: MapPin,
    },
    {
      id: "skcli",
      title: "SKCL - Cali",
      code: "SKCL",
      city: "Cali",
      icon: MapPin,
    },
    {
      id: "skmd",
      title: "SKMD - Medellín",
      code: "SKMD",
      city: "Medellín",
      icon: MapPin,
    },
    {
      id: "skcg",
      title: "SKCG - Cartagena",
      code: "SKCG",
      city: "Cartagena",
      icon: MapPin,
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212]">
      {/* Hero Search Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 pb-6 sm:pb-8">
        <div className="max-w-[1180px] mx-auto text-center">
          <h1 className="text-[clamp(32px,5vw,56px)] font-bold text-black dark:text-white leading-tight mb-4">
            {t(language, "home.mainTitle")}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {t(language, "home.mainSubtitle")}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(language, "home.searchPlaceholder")}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-[#1E1E1E] text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#468BFF] focus:border-transparent"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Main Features */}
      <section className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-[1180px] mx-auto">
          <h2 className="text-[clamp(28px,4vw,40px)] font-bold text-black dark:text-white leading-tight mb-8 text-center">
            {t(language, "home.aviationServices")}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {mainFeatures.map((feature) => {
              const IconComponent = feature.icon;
              const status = t(language, feature.statusKey);
              const isComingSoon =
                status === "Coming Soon" || status === "Próximamente";

              return (
                <div
                  key={feature.id}
                  className={`bg-white dark:bg-[#1E1E1E] border border-[#E8E8E8] dark:border-[#3A3A3A] rounded-[24px] p-8 shadow-[0_4px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.05)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_16px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 transition-all duration-200 ease-out ${isComingSoon ? "opacity-75" : ""}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shrink-0`}
                    >  
                      {IconComponent && (
                        <IconComponent size={28} className="text-white" />
                      )}
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          status === "Active" || status === "Activo"
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : status === "Beta"
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3">
                    {t(language, feature.titleKey)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {t(language, feature.descriptionKey)}
                  </p>

                  {/* Action Button */}
                  <a
                    href={isComingSoon ? "#" : feature.link}
                    className={`inline-flex items-center gap-2 font-semibold text-sm transition-all duration-200 ${
                      isComingSoon
                        ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "text-black dark:text-white hover:underline group"
                    }`}
                  >
                    <span>{t(language, feature.actionKey)}</span>
                    {!isComingSoon && (
                      <ArrowUpRight
                        size={16}
                        className="transition-transform duration-200 group-hover:rotate-45"
                      />
                    )}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access to Major Airports */}
      <section className="bg-[#e4e4c1] dark:bg-[#343420] px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-[1180px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-[clamp(24px,4vw,32px)] font-bold text-[#343420] dark:text-[#e4e4c1] leading-tight mb-2">
              {t(language, "home.majorAirports")}
            </h2>
            <p className="text-[#343420]/80 dark:text-[#dcc39c]">
              {t(language, "home.majorAirportsDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccess.map((airport) => {
              const IconComponent = airport.icon;
              return (
                <a
                  key={airport.id}
                  href={`/airport/${airport.code}`}
                  className="bg-white dark:bg-[#1E1E1E] border border-[#dcc39c] dark:border-[#949484] rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center">
                      <IconComponent size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-black dark:text-white group-hover:text-[#1E3A8A] transition-colors duration-200">
                        {airport.code}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {airport.city}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-gray-400 group-hover:text-[#1E3A8A] transition-all duration-200 group-hover:rotate-45"
                    />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Coming Soon */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 bg-gradient-to-b from-[#dcc39c]/20 to-transparent dark:from-[#343420]/20">
        <div className="max-w-[1180px] mx-auto text-center">
          <h2 className="text-[clamp(24px,4vw,32px)] font-bold text-black dark:text-white leading-tight mb-4">
            {t(language, "home.moreFeatures")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#343420] dark:text-[#dcc39c]">
            <div className="flex items-center gap-2 bg-[#e4e4c1]/50 dark:bg-[#343420]/30 px-4 py-2 rounded-full">
              <Clock size={16} />
              <span>{t(language, "home.weatherIntegration")}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#e4e4c1]/50 dark:bg-[#343420]/30 px-4 py-2 rounded-full">
              <FileText size={16} />
              <span>{t(language, "home.flightPlanning")}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#e4e4c1]/50 dark:bg-[#343420]/30 px-4 py-2 rounded-full">
              <MessageCircle size={16} />
              <span>{t(language, "home.communityForum")}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
