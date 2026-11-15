import type { Language, Unit } from "@/types/weather";

export function formatTemperature(value: number, unit: Unit = "celsius"): string {
  const temperature = unit === "fahrenheit" ? (value * 9) / 5 + 32 : value;
  return `${Math.round(temperature)}°`;
}

export function formatDay(date: string, locale = "es-ES"): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(`${date}T12:00:00`));
}

export function formatDate(timestamp: number, language: Language): string {
  const locale = language === "es" ? "es-ES" : "en-US";
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(timestamp * 1000));
  return date.charAt(0).toLocaleUpperCase(locale) + date.slice(1);
}

export function sentenceCase(value: string): string {
  const normalized = value.toLocaleLowerCase();
  return normalized.charAt(0).toLocaleUpperCase() + normalized.slice(1);
}

export function formatWindDirection(degrees: number, language: Language): string {
  const directions =
    language === "es"
      ? ["N", "NE", "E", "SE", "S", "SO", "O", "NO"]
      : ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
}
