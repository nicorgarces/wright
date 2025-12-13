import { create } from "zustand";
import { persist } from "zustand/middleware";

const useLanguage = create(
  persist(
    (set) => ({
      language: "en", // default language
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === "en" ? "es" : "en" })),
    }),
    {
      name: "wright-language", // localStorage key
    },
  ),
);

export default useLanguage;
