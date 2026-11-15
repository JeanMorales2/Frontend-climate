import type { ForecastDay, Weather } from "@/types/weather";

type RawWeather = {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: { description: string; icon: string }[];
  wind: { speed: number; deg?: number };
  clouds?: { all: number };
  visibility?: number;
  dt: number;
};

export function mapWeather(raw: RawWeather): Weather {
  return {
    city: raw.name,
    country: raw.sys.country,
    temperature: raw.main.temp,
    min: raw.main.temp_min,
    max: raw.main.temp_max,
    feelsLike: raw.main.feels_like,
    humidity: raw.main.humidity,
    description: raw.weather[0]?.description ?? "Clima no disponible",
    icon: raw.weather[0]?.icon ?? "01d",
    windSpeed: raw.wind.speed,
    windDegrees: raw.wind.deg ?? 0,
    pressure: raw.main.pressure,
    visibility: raw.visibility ?? 0,
    clouds: raw.clouds?.all ?? 0,
    sunrise: raw.sys.sunrise,
    sunset: raw.sys.sunset,
    updatedAt: raw.dt,
  };
}

type RawForecast = {
  list: {
    dt_txt: string;
    main: { temp_min: number; temp_max: number };
    weather: { description: string; icon: string }[];
  }[];
};

export function mapForecast(raw: RawForecast): ForecastDay[] {
  const days = new Map<string, ForecastDay>();

  // La API entrega intervalos de tres horas; agrupamos sus extremos por fecha local del proveedor.
  for (const item of raw.list) {
    const date = item.dt_txt.slice(0, 10);
    const day = days.get(date);
    if (day) {
      day.min = Math.min(day.min, item.main.temp_min);
      day.max = Math.max(day.max, item.main.temp_max);
    } else {
      days.set(date, {
        date,
        min: item.main.temp_min,
        max: item.main.temp_max,
        description: item.weather[0]?.description ?? "",
        icon: item.weather[0]?.icon ?? "01d",
      });
    }
  }

  return [...days.values()].slice(0, 5);
}
