import { Bell, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import Header from "../../components/Header";
import useLanguage from "../../utils/useLanguage";
import { t } from "../../utils/translations";

export default function NOTAMPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A1628]">
      <Header />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-12">
        {/* Coming Soon Content */}
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#c4c284] to-[#dcc39c] rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Bell size={36} className="text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E3A8A] dark:text-white mb-4">
            {t(language, "notam.title")}
          </h1>

          <p className="text-lg text-[#64748B] dark:text-[#94A3B8] mb-8 max-w-2xl mx-auto">
            {t(language, "notam.subtitle")}
          </p>

          <div className="bg-[#e4e4c1]/50 dark:bg-[#343420]/30 border border-[#dcc39c] dark:border-[#949484]/30 rounded-xl p-6 max-w-2xl mx-auto mb-8">
            <div className="flex items-start gap-3">
              <Clock
                size={20}
                className="text-[#343420] dark:text-[#dcc39c] flex-shrink-0 mt-0.5"
              />
              <div className="text-sm">
                <p className="font-medium text-[#343420] dark:text-[#dcc39c] mb-2">
                  {t(language, "notam.comingSoonTitle")}
                </p>
                <ul className="text-[#343420] dark:text-[#c4c284] text-left space-y-1">
                  {t(language, "notam.features").map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-6 max-w-2xl mx-auto mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
              />
              <div className="text-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                  {t(language, "notam.importantTitle")}
                </p>
                <p className="text-yellow-800 dark:text-yellow-300 text-left">
                  {t(language, "notam.importantText")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-[#1E3A5F] hover:bg-gray-100 dark:hover:bg-[#1E40AF] text-[#1E3A8A] dark:text-white border border-[#dcc39c] dark:border-[#949484]/30 px-6 py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm"
            >
              <ArrowLeft size={20} />
              {t(language, "notam.backHome")}
            </a>

            <a
              href="/rac-ai"
              className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] hover:from-[#1E40AF] hover:to-[#2563EB] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {t(language, "notam.askRacAi")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
