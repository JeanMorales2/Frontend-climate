"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cloud } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { RecentSearches } from "@/components/search/RecentSearches";
import { CurrentWeather } from "@/components/weather/CurrentWeather";
import { WeatherDetails } from "@/components/weather/WeatherDetails";
import { Forecast } from "@/components/weather/Forecast";
import { WeatherBackground } from "@/components/background/WeatherBackground";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeletons } from "@/components/feedback/Skeletons";
import { PreferenceControls } from "@/components/ui/PreferenceControls";
import { useWeather } from "@/hooks/useWeather";
import { useForecast } from "@/hooks/useForecast";
import { usePreferences } from "@/store/preferences";
import { translate } from "@/lib/i18n";

export default function Home() {
  const [city, setCity] = useState("");
  const {
    unit,
    setUnit,
    theme,
    setTheme,
    language,
    setLanguage,
    recent,
    addRecent,
    removeRecent,
    clearRecent,
  } = usePreferences();
  const weather = useWeather(city, language);
  const forecast = useForecast(city, language);

  useEffect(() => {
    document.documentElement.classList.remove("theme-light", "theme-dark", "theme-system");
    document.documentElement.classList.add(`theme-${theme}`);
    document.documentElement.lang = language;
  }, [theme, language]);

  function search(nextCity: string) {
    const normalized = nextCity.trim();
    if (!normalized) return;
    setCity(normalized);
    addRecent(normalized);
  }

  return (
    <main className={`shell theme-${theme}`}>
      <WeatherBackground icon={weather.data?.icon} />
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">
            <Cloud size={21} aria-hidden="true" />
          </span>
          cielo<span className="brand-dot">.</span>
        </a>
        <div className="header-actions">
          <span className="eyebrow">{translate(language, "brandEyebrow")}</span>
          <PreferenceControls
            language={language}
            theme={theme}
            unit={unit}
            onLanguage={setLanguage}
            onTheme={setTheme}
            onUnit={() => setUnit(unit === "celsius" ? "fahrenheit" : "celsius")}
          />
        </div>
      </header>
      <section className="intro">
        <p className="eyebrow">{translate(language, "localForecast")}</p>
        <h1>
          {translate(language, "titleFirst")}
          <br />
          {translate(language, "titleSecond")} <em>{translate(language, "titleAccent")}</em>
        </h1>
        <p className="intro-copy">{translate(language, "introCopy")}</p>
        <SearchBar
          language={language}
          onSearch={search}
          loading={weather.isLoading}
          error={weather.isError}
        />
        {!city && (
          <RecentSearches
            cities={recent}
            language={language}
            onSelect={search}
            onRemove={removeRecent}
            onClear={clearRecent}
          />
        )}
      </section>
      <AnimatePresence mode="wait">
        {!city ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 150, damping: 22 }}
          >
            <EmptyState language={language} />
          </motion.div>
        ) : weather.isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Skeletons language={language} />
          </motion.div>
        ) : weather.isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -7, 7, -4, 4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <ErrorState language={language} code={weather.error.message} />
          </motion.div>
        ) : weather.data ? (
          <motion.section
            key={city}
            className="results"
            aria-live="polite"
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -8, filter: "blur(5px)" }}
            variants={{
              hidden: { opacity: 0, y: 12, filter: "blur(5px)" },
              show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { type: "spring", stiffness: 140, damping: 22, staggerChildren: 0.06 },
              },
            }}
          >
            <CurrentWeather
              weather={weather.data}
              language={language}
              unit={unit}
              onToggleUnit={() => setUnit(unit === "celsius" ? "fahrenheit" : "celsius")}
            />
            <WeatherDetails weather={weather.data} language={language} unit={unit} />
            <Forecast days={forecast.data ?? []} language={language} unit={unit} />
          </motion.section>
        ) : null}
      </AnimatePresence>
      <footer>
        <span>{translate(language, "footer")}</span>
        <span>OpenWeather · Open-Meteo</span>
      </footer>
    </main>
  );
}
