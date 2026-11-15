"use client";

import { motion } from "motion/react";
import type { ForecastDay, Language, Unit } from "@/types/weather";
import { formatDay, formatTemperature, sentenceCase } from "@/utils/format";
import { translate } from "@/lib/i18n";
import { WeatherIcon } from "./WeatherIcon";

export function Forecast({
  days,
  language,
  unit,
}: {
  days: ForecastDay[];
  language: Language;
  unit: Unit;
}) {
  const locale = language === "es" ? "es-ES" : "en-US";
  const lowest = Math.min(...days.map((day) => day.min));
  const highest = Math.max(...days.map((day) => day.max));
  const spread = Math.max(1, highest - lowest);
  return (
    <article className="panel forecast">
      <h2>{translate(language, "forecast")}</h2>
      {days.length ? (
        <motion.div
          className="forecast-row"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
          {days.map((day) => {
            const left = ((day.min - lowest) / spread) * 100;
            const width = Math.max(8, ((day.max - day.min) / spread) * 100);
            return (
              <motion.div
                className="forecast-day"
                key={`${day.date}-${day.icon}`}
                tabIndex={0}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 180, damping: 18 },
                  },
                }}
              >
                <span>{formatDay(day.date, locale)}</span>
                <WeatherIcon key={day.icon} code={day.icon} className="forecast-icon" />
                <small className="forecast-description">{sentenceCase(day.description)}</small>
                <strong>
                  {translate(language, "max")} {formatTemperature(day.max, unit)}
                </strong>
                <span className="muted">
                  {translate(language, "min")} {formatTemperature(day.min, unit)}
                </span>
                <span className="temperature-range" aria-hidden="true">
                  <motion.i
                    initial={{ left: `${left}%`, width: 0 }}
                    animate={{ left: `${left}%`, width: `${width}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <p className="muted">{translate(language, "forecastSoon")}</p>
      )}
    </article>
  );
}
