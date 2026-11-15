export type WeatherCondition = "clear" | "clouds" | "rain" | "snow" | "storm" | "mist";

export function getCondition(icon: string): WeatherCondition {
  const code = icon.slice(0, 2);
  if (code === "01") return "clear";
  if (code === "02" || code === "03" || code === "04") return "clouds";
  if (code === "09" || code === "10") return "rain";
  if (code === "11") return "storm";
  if (code === "13") return "snow";
  return "mist";
}
