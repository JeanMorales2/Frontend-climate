import type { ForecastDay, Language, Theme, Weather } from "@/types/weather";
import { translate, type MessageKey } from "@/lib/i18n";

export type DemoCondition = "clear" | "clear-night" | "clouds" | "rain" | "storm" | "snow" | "mist";

export type DemoStep = {
  condition: DemoCondition;
  label: string;
  icon: string;
  theme: Extract<Theme, "light" | "dark">;
  weather: Weather;
  forecast: ForecastDay[];
};

const samples: Array<{ condition: DemoCondition; icon: string; labelKey: MessageKey }> = [
  { condition: "clear", icon: "01d", labelKey: "demoClear" },
  { condition: "clear-night", icon: "01n", labelKey: "demoClearNight" },
  { condition: "clouds", icon: "04d", labelKey: "demoClouds" },
  { condition: "rain", icon: "10d", labelKey: "demoRain" },
  { condition: "storm", icon: "11d", labelKey: "demoStorm" },
  { condition: "snow", icon: "13d", labelKey: "demoSnow" },
  { condition: "mist", icon: "50d", labelKey: "demoMist" },
];

function makeForecast(icon: string, description: string): ForecastDay[] {
  return Array.from({ length: 5 }, (_, index) => ({
    date: new Date(Date.now() + (index + 1) * 86400000).toISOString().slice(0, 10),
    min: 17 + index,
    max: 25 + index,
    description,
    icon,
  }));
}

export function createDemoSteps(language: Language): DemoStep[] {
  return samples.flatMap((sample, index) =>
    (["light", "dark"] as const).map((theme) => {
      const description = translate(language, sample.labelKey);
      return {
        condition: sample.condition,
        label: description,
        icon: sample.icon,
        theme,
        weather: {
          city: "Managua",
          country: "NI",
          temperature: 26 + (index % 4),
          min: 20 + (index % 3),
          max: 30 + (index % 3),
          feelsLike: 27 + (index % 4),
          humidity: 52 + index * 5,
          description,
          icon: sample.icon,
          windSpeed: 2.5 + index / 2,
          windDegrees: 45 + index * 35,
          pressure: 1008 + index,
          visibility: Math.max(2500, 10000 - index * 1100),
          clouds: index * 13,
          sunrise: Date.now() - 3 * 3600000,
          sunset: Date.now() + 4 * 3600000,
          updatedAt: Date.now(),
        },
        forecast: makeForecast(sample.icon, description),
      };
    }),
  );
}
