"use client";

import { Languages, Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { translate } from "@/lib/i18n";
import type { Language, Theme, Unit } from "@/types/weather";

type Props = {
  language: Language;
  theme: Theme;
  unit: Unit;
  onLanguage: (value: Language) => void;
  onTheme: (value: Theme) => void;
  onUnit: () => void;
};

export function PreferenceControls({ language, theme, unit, onLanguage, onTheme, onUnit }: Props) {
  const themes = ["system", "light", "dark"] as const;
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
  const ThemeIcon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;

  function changeTheme(nextTheme: Theme) {
    if ("startViewTransition" in document) {
      document.startViewTransition(() => onTheme(nextTheme));
    } else {
      onTheme(nextTheme);
    }
  }

  return (
    <div className="preference-controls">
      <div className="compact-preferences">
        <button
          className="compact-preference unit-compact"
          type="button"
          aria-label={translate(language, "unit")}
          onClick={onUnit}
        >
          °{unit === "celsius" ? "C" : "F"}
        </button>
        <button
          className="compact-preference theme-compact"
          type="button"
          aria-label={`${translate(language, "theme")}: ${translate(language, theme)}. ${translate(language, "changeTo")} ${translate(language, nextTheme)}`}
          onClick={() => changeTheme(nextTheme)}
        >
          <ThemeIcon size={16} aria-hidden="true" />
        </button>
        <button
          className="compact-preference language-compact"
          type="button"
          aria-label={translate(language, "language")}
          onClick={() => onLanguage(language === "es" ? "en" : "es")}
        >
          {language.toUpperCase()}
        </button>
      </div>
      <div className="full-preferences">
        <div
          className="choice-control unit-control"
          role="group"
          aria-label={translate(language, "unit")}
        >
          {(["celsius", "fahrenheit"] as const).map((value) => (
            <motion.button
              type="button"
              key={value}
              className="choice-option"
              aria-label={value === "celsius" ? "°C" : "°F"}
              aria-pressed={unit === value}
              onClick={() => unit !== value && onUnit()}
            >
              {unit === value && (
                <motion.span className="choice-highlight" layoutId="unit-toggle-highlight" />
              )}
              <span>{value === "celsius" ? "°C" : "°F"}</span>
            </motion.button>
          ))}
        </div>
        <div className="choice-control" role="group" aria-label={translate(language, "theme")}>
          <Sun size={14} aria-hidden="true" />
          {themes.map((value) => (
            <motion.button
              type="button"
              key={value}
              className="choice-option"
              aria-label={translate(language, value)}
              aria-pressed={theme === value}
              onClick={() => changeTheme(value)}
            >
              {theme === value && (
                <motion.span className="choice-highlight" layoutId="theme-toggle-highlight" />
              )}
              <span>{translate(language, value)}</span>
            </motion.button>
          ))}
          <Moon size={14} aria-hidden="true" />
        </div>
        <div
          className="choice-control language-control"
          role="group"
          aria-label={translate(language, "language")}
        >
          <Languages size={14} aria-hidden="true" />
          {(["es", "en"] as const).map((value) => (
            <motion.button
              type="button"
              key={value}
              className="choice-option"
              aria-label={value.toUpperCase()}
              aria-pressed={language === value}
              onClick={() => onLanguage(value)}
            >
              {language === value && (
                <motion.span className="choice-highlight" layoutId="language-toggle-highlight" />
              )}
              <span>{value.toUpperCase()}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
