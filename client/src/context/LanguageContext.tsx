import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import { IntlProvider } from "use-intl";
import azMessages from "../messages/az.json";
import ruMessages from "../messages/ru.json";

type Locale = "az" | "ru";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const messages = {
  az: azMessages,
  ru: ruMessages,
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>("az");

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <IntlProvider messages={messages[locale]} locale={locale} timeZone="Asia/Baku">
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
