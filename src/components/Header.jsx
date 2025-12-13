import { Menu, X, Plane, Languages, Database } from "lucide-react";
import { useState, useEffect } from "react";
import useLanguage from "../utils/useLanguage";
import { t } from "../utils/translations";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  // Track current path on the client
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Shared classes for desktop nav links
  const desktopLinkBase =
    "flex items-center px-3 h-full font-medium transition-colors duration-200";
  const desktopLinkActive =
    // same gradient + white text as Ask RAC AI, rectangular and full height
    "bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white shadow-sm";
  const desktopLinkInactive =
    "text-[#1E3A8A] dark:text-white hover:text-[#3B82F6] dark:hover:text-[#60A5FA]";

  return (
    <header className="bg-white dark:bg-[#0A1628] border-b border-[#E5E7EB] dark:border-[#1E3A5F] px-4 sm:px-6 shadow-sm">
      <div className="max-w-[1180px] mx-auto">
        {/* Top row: fixed height, no extra vertical padding */}
        <div className="flex items-stretch justify-between h-14">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center mr-3 shadow-md">
              <Plane size={20} className="text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-[#1E3A8A] dark:text-white leading-none">
                Wright
              </span>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                {t(language, "header.tagline")}
              </div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-stretch space-x-1 h-full">
            <a
              href="/airports"
              className={`${desktopLinkBase} ${
                pathname.startsWith("/airports")
                  ? desktopLinkActive
                  : desktopLinkInactive
              }`}
            >
              {t(language, "header.airports")}
            </a>
            <a
              href="/notam"
              className={`${desktopLinkBase} ${
                pathname.startsWith("/notam")
                  ? desktopLinkActive
                  : desktopLinkInactive
              }`}
            >
              {t(language, "header.notam")}
            </a>
            <a
              href="/pricing"
              className={`${desktopLinkBase} ${
                pathname.startsWith("/pricing")
                  ? desktopLinkActive
                  : desktopLinkInactive
              }`}
            >
              {t(language, "header.pricing")}
            </a>
            <a
              href="/rac-ai"
              className={`${desktopLinkBase} ${
                pathname.startsWith("/rac-ai")
                  ? desktopLinkActive
                  : desktopLinkInactive
              }`}
            >
              {t(language, "header.racAi")}
            </a>
            <a
              href="/admin/scraper"
              className={`${desktopLinkBase} ${
                pathname.startsWith("/admin")
                  ? desktopLinkActive
                  : desktopLinkInactive
              }`}
            >
              {t(language, "header.admin")}
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E7EB] dark:border-[#3B82F6]/30 text-[#1E3A8A] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1E3A5F]/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-[#0A1628]"
              aria-label="Toggle language"
            >
              <Languages size={18} />
              <span className="font-medium text-sm">
                {language === "en" ? "ES" : "EN"}
              </span>
            </button>

            {/* CTA Button */}
            <a
              href="/rac-ai"
              className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] hover:from-[#1E40AF] hover:to-[#2563EB] text-white px-6 py-2.5 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-[#0A1628]"
            >
              {t(language, "header.askRacAi")}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex items-center text-[#1E3A8A] dark:text-white hover:text-[#3B82F6] dark:hover:text-[#60A5FA] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-[#0A1628] focus:rounded-md"
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#E5E7EB] dark:border-[#1E3A5F] pb-4">
            <nav className="flex flex-col space-y-4">
              <a
                href="/airports"
                className="text-[#1E3A8A] dark:text-white hover:text-[#3B82F6] dark:hover:text-[#60A5FA] font-medium transition-colors duration-200"
              >
                {t(language, "header.airports")}
              </a>
              <a
                href="/notam"
                className="text-[#1E3A8A] dark:text-white hover:text-[#3B82F6] dark:hover:text-[#60A5FA] font-medium transition-colors duration-200"
              >
                {t(language, "header.notam")}
              </a>
              <a
                href="/pricing"
                className="text-[#1E3A8A] dark:text-white hover:text-[#3B82F6] dark:hover:text-[#60A5FA] font-medium transition-colors duration-200"
              >
                {t(language, "header.pricing")}
              </a>
              <a
                href="/rac-ai"
                className="text-[#1E3A8A] dark:text-white hover:text-[#3B82F6] dark:hover:text-[#60A5FA] font-medium transition-colors duration-200"
              >
                {t(language, "header.racAiAssistant")}
              </a>
              <a
                href="/admin/scraper"
                className="text-[#1E3A8A] dark:text-white hover:text-[#3B82F6] dark:hover:text-[#60A5FA] font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <Database size={18} />
                eAIP Scraper
              </a>

              {/* Mobile Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#3B82F6]/30 text-[#1E3A8A] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1E3A5F]/50 transition-colors duration-200 font-medium"
              >
                <Languages size={18} />
                <span>
                  {language === "en"
                    ? "Cambiar a Español"
                    : "Switch to English"}
                </span>
              </button>

              <div className="pt-4">
                <a
                  href="/rac-ai"
                  className="block bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] hover:from-[#1E40AF] hover:to-[#2563EB] text-white px-6 py-2.5 rounded-full font-medium transition-all duration-200 shadow-md text-center"
                >
                  {t(language, "header.askRacAi")}
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
