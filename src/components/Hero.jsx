import { Search, Plane, Cloud, Compass } from "lucide-react";
import { useState } from "react";
import useLanguage from "../utils/useLanguage";
import { t } from "../utils/translations";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1E40AF] overflow-hidden">
      {/* Aeronautical Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10">
          <Plane size={120} className="text-white rotate-45" />
        </div>
        <div className="absolute bottom-20 right-20">
          <Compass size={100} className="text-white" />
        </div>
        <div className="absolute top-1/2 left-1/4">
          <Cloud size={80} className="text-white" />
        </div>
      </div>

      <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Plane size={16} className="text-[#60A5FA]" />
            <span className="text-sm font-medium text-white">
              {t(language, "hero.badge")}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t(language, "hero.title1")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#93C5FD]">
              {t(language, "hero.title2")}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[#CBD5E1] max-w-2xl mx-auto mb-10">
            {t(language, "hero.subtitle")}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <form onSubmit={handleSearch} className="relative">
              <div className="h-[56px] sm:h-[68px] border border-white/30 rounded-full flex items-center overflow-hidden bg-white/10 backdrop-blur-sm">
                <input
                  type="text"
                  placeholder={t(language, "hero.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent pl-4 sm:pl-8 pr-4 h-full text-white placeholder-[#CBD5E1] font-light text-lg sm:text-xl focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-full px-4 sm:px-6 lg:px-8 bg-white text-[#1E3A8A] font-semibold text-xs sm:text-sm lg:text-lg rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1E3A8A] -mr-px whitespace-nowrap gap-2"
                >
                  <Search size={16} />
                  <span className="hidden sm:inline">
                    {t(language, "hero.searchButton")}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick access links */}
          <div className="mb-16 flex flex-wrap justify-center gap-4 text-sm">
            <span className="text-[#CBD5E1]">
              {t(language, "hero.quickAccess")}
            </span>
            <a
              href="/airport/SKBO"
              className="text-white hover:text-[#60A5FA] transition-colors"
            >
              SKBO (El Dorado)
            </a>
            <a
              href="/airport/SKCL"
              className="text-white hover:text-[#60A5FA] transition-colors"
            >
              SKCL (Cali)
            </a>
            <a
              href="/airport/SKCG"
              className="text-white hover:text-[#60A5FA] transition-colors"
            >
              SKCG (Cartagena)
            </a>
            <a
              href="/airport/SKMD"
              className="text-white hover:text-[#60A5FA] transition-colors"
            >
              SKMD (Medellín)
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/airports"
              className="bg-white hover:bg-gray-100 text-[#1E3A8A] px-8 py-4 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1E3A8A]"
            >
              {t(language, "hero.exploreAirports")}
            </a>
            <a
              href="/rac-ai"
              className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] hover:from-[#2563EB] hover:to-[#3B82F6] text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:ring-offset-2 focus:ring-offset-[#1E3A8A]"
            >
              {t(language, "hero.askRacAi")}
            </a>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Plane size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t(language, "hero.aipTitle")}
              </h3>
              <p className="text-sm text-[#CBD5E1]">
                {t(language, "hero.aipDesc")}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Cloud size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t(language, "hero.notamTitle")}
              </h3>
              <p className="text-sm text-[#CBD5E1]">
                {t(language, "hero.notamDesc")}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Compass size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t(language, "hero.racTitle")}
              </h3>
              <p className="text-sm text-[#CBD5E1]">
                {t(language, "hero.racDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="rgb(249, 250, 251)"
            className="dark:fill-[#0A1628]"
          />
        </svg>
      </div>
    </div>
  );
}
