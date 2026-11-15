"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cloud } from "lucide-react";
import { RecentSearches, SearchBar } from "@/features/search";
import { CurrentWeather, Forecast, useForecast, useWeather, WeatherDetails } from "@/features/weather";
import { WeatherBackground } from "@/features/background";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeletons } from "@/components/ui/Skeletons";
import { PreferenceControls } from "@/features/preferences";
import { usePreferences } from "@/stores/preferences";
import { translate } from "@/lib/i18n";
import { DemoWelcome, useDemo } from "@/features/demo";

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
  const demo = useDemo(language);
  const demoButtonRef = useRef<HTMLButtonElement>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSearchPrompt, setShowSearchPrompt] = useState(false);
  const weather = useWeather(city, language, !demo.running);
  const forecast = useForecast(city, language, !demo.running);
  const displayWeather = demo.step?.weather ?? weather.data;
  const displayForecast = demo.step?.forecast ?? forecast.data ?? [];
  const visualTheme = demo.step?.theme ?? theme;

  useEffect(() => {
    document.documentElement.classList.remove("theme-light", "theme-dark", "theme-system");
    document.documentElement.classList.add(`theme-${visualTheme}`);
    document.documentElement.lang = language;
  }, [visualTheme, language]);

  useEffect(() => {
    if (city) return;
    // La bienvenida pertenece a esta entrada de la página, no a una sesión del navegador.
    setShowWelcome(true);
  }, [city]);

  const closeWelcome = useCallback(() => {
    setShowWelcome(false);
    setShowSearchPrompt(true);
  }, []);
  const startDemo = useCallback(() => { closeWelcome(); demo.start(); }, [closeWelcome, demo]);

  function search(nextCity: string) {
    const normalized = nextCity.trim();
    if (!normalized) return;
    demo.stop();
    setShowSearchPrompt(false);
    setCity(normalized);
    addRecent(normalized);
  }

  return (
    <main className={`shell theme-${visualTheme}`}>
      <WeatherBackground icon={displayWeather?.icon} />
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
            onLanguage={(nextLanguage) => {
              if (demo.running) demo.stop();
              setLanguage(nextLanguage);
            }}
            onTheme={(nextTheme) => {
              if (demo.running) demo.stop();
              setTheme(nextTheme);
            }}
            onUnit={() => setUnit(unit === "celsius" ? "fahrenheit" : "celsius")}
            demoRunning={demo.running}
            demoButtonRef={demoButtonRef}
            onDemo={() => {
              setShowSearchPrompt(false);
              if (demo.running) { demo.stop(); setShowSearchPrompt(true); }
              else startDemo();
            }}
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
          onInteract={() => {
            if (demo.running) demo.stop();
          }}
        />
        {showSearchPrompt && <p className="search-prompt" aria-live="polite">{translate(language, "searchPrompt")}</p>}
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
      <AnimatePresence>
        {demo.running && demo.step ? (
          <motion.section key={`demo-${demo.index}`} className="results demo-results" aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="demo-indicator">{translate(language, "demoLabel")} · {demo.step.label} · {translate(language, demo.step.theme)} <span>{(demo.index ?? 0) + 1}/{demo.total}</span></p>
            <CurrentWeather weather={demo.step.weather} language={language} unit={unit} onToggleUnit={() => setUnit(unit === "celsius" ? "fahrenheit" : "celsius")} />
            <WeatherDetails weather={demo.step.weather} language={language} unit={unit} />
            <Forecast days={demo.step.forecast} language={language} unit={unit} />
          </motion.section>
        ) : !city ? (
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
        ) : displayWeather ? (
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
              weather={displayWeather}
              language={language}
              unit={unit}
              onToggleUnit={() => setUnit(unit === "celsius" ? "fahrenheit" : "celsius")}
            />
            <WeatherDetails weather={displayWeather} language={language} unit={unit} />
            <Forecast days={displayForecast} language={language} unit={unit} />
          </motion.section>
        ) : null}
      </AnimatePresence>
      <footer>
        <span>{translate(language, "footer")}</span>
      </footer>
      <AnimatePresence>{showWelcome && !city && <DemoWelcome language={language} demoButtonRef={demoButtonRef} onClose={closeWelcome} onStart={startDemo} />}</AnimatePresence>
    </main>
  );
}
