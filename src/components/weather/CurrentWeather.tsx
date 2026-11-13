"use client";

import { useEffect } from "react";
import { MapPin } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { Language, Unit, Weather } from "@/types/weather";
import { formatDate, formatTemperature } from "@/lib/format";
import { translate } from "@/lib/i18n";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { sentenceCase } from "@/lib/format";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export function CurrentWeather({
  weather,
  language,
  unit,
  onToggleUnit,
}: {
  weather: Weather;
  language: Language;
  unit: Unit;
  onToggleUnit: () => void;
}) {
  const tiltX = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  useEffect(() => {
    if (!window.matchMedia("(max-width: 639px)").matches) return;
    const card = document.querySelector<HTMLElement>(".current");
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    if (isVisible) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, []);
  function moveCard(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" || !window.matchMedia("(pointer: fine)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    tiltX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 12);
    tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 12);
  }
  return (
    <motion.article
      className="panel current"
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      onPointerMove={moveCard}
      onPointerLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
      style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
    >
      <div className="location">
        <MapPin size={17} aria-hidden="true" />
        {weather.city}, {weather.country}
      </div>
      <p className="local-date">{formatDate(weather.updatedAt, language)}</p>
      <WeatherIcon code={weather.icon} />
      <div className="temperature">
        <AnimatedNumber value={formatTemperature(weather.temperature, unit)} />
      </div>
      <p className="description">{sentenceCase(weather.description)}</p>
      <p className="range">
        {translate(language, "min")} {formatTemperature(weather.min, unit)} ·{" "}
        {translate(language, "max")} {formatTemperature(weather.max, unit)}
      </p>
      <p className="feels-like">
        {translate(language, "feelsLike")} {formatTemperature(weather.feelsLike, unit)}
      </p>
      <button
        className="current-unit"
        type="button"
        onClick={onToggleUnit}
        aria-label={translate(language, "unit")}
      >
        {unit === "celsius" ? "°C / °F" : "°F / °C"}
      </button>
    </motion.article>
  );
}
