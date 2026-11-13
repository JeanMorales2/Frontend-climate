import type { CitySuggestion, ForecastDay, Language, Weather } from "@/types/weather";

// Open-Meteo no pide API key. Se usa cuando no hay OPENWEATHER_API_KEY configurada,
// así la app funciona apenas se clona el proyecto.
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

type Condition = { icon: string; es: string; en: string };

// Códigos WMO que devuelve Open-Meteo, traducidos a los íconos de OpenWeather
// para reutilizar los mismos componentes visuales.
const conditions: Record<number, Condition> = {
  0: { icon: "01", es: "cielo despejado", en: "clear sky" },
  1: { icon: "01", es: "mayormente despejado", en: "mainly clear" },
  2: { icon: "02", es: "parcialmente nublado", en: "partly cloudy" },
  3: { icon: "04", es: "nublado", en: "overcast" },
  45: { icon: "50", es: "niebla", en: "fog" },
  48: { icon: "50", es: "niebla con escarcha", en: "depositing rime fog" },
  51: { icon: "09", es: "llovizna ligera", en: "light drizzle" },
  53: { icon: "09", es: "llovizna", en: "drizzle" },
  55: { icon: "09", es: "llovizna intensa", en: "dense drizzle" },
  56: { icon: "09", es: "llovizna helada", en: "freezing drizzle" },
  57: { icon: "09", es: "llovizna helada intensa", en: "dense freezing drizzle" },
  61: { icon: "10", es: "lluvia ligera", en: "light rain" },
  63: { icon: "10", es: "lluvia", en: "rain" },
  65: { icon: "10", es: "lluvia intensa", en: "heavy rain" },
  66: { icon: "10", es: "lluvia helada", en: "freezing rain" },
  67: { icon: "10", es: "lluvia helada intensa", en: "heavy freezing rain" },
  71: { icon: "13", es: "nevada ligera", en: "light snow" },
  73: { icon: "13", es: "nevada", en: "snow" },
  75: { icon: "13", es: "nevada intensa", en: "heavy snow" },
  77: { icon: "13", es: "granos de nieve", en: "snow grains" },
  80: { icon: "09", es: "chubascos ligeros", en: "light showers" },
  81: { icon: "09", es: "chubascos", en: "showers" },
  82: { icon: "09", es: "chubascos fuertes", en: "violent showers" },
  85: { icon: "13", es: "chubascos de nieve", en: "snow showers" },
  86: { icon: "13", es: "chubascos de nieve intensos", en: "heavy snow showers" },
  95: { icon: "11", es: "tormenta", en: "thunderstorm" },
  96: { icon: "11", es: "tormenta con granizo", en: "thunderstorm with hail" },
  99: { icon: "11", es: "tormenta con granizo fuerte", en: "thunderstorm with heavy hail" },
};

export function describeWeatherCode(code: number, language: Language, isDay = true) {
  const condition = conditions[code] ?? conditions[3];
  return {
    description: condition[language],
    icon: `${condition.icon}${isDay ? "d" : "n"}`,
  };
}

type GeocodingResult = {
  name: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  admin1?: string;
};

type Place = { name: string; country: string; lat: number; lon: number };

type ForecastResponse = {
  utc_offset_seconds: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    pressure_msl: number;
    cloud_cover: number;
    visibility: number;
    is_day: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { next: { revalidate: 600 } });
  if (!response.ok) throw new Error("UPSTREAM_ERROR");
  return response.json() as Promise<T>;
}

// Open-Meteo devuelve horas locales sin zona ("2026-11-13T17:00"); con el desfase
// de la respuesta se pasan a segundos Unix, igual que en OpenWeather.
export function localTimeToUnix(time: string, utcOffsetSeconds: number) {
  return Date.parse(`${time}Z`) / 1000 - utcOffsetSeconds;
}

export async function searchOpenMeteoCities(
  name: string,
  language: Language = "es",
  count = 5,
): Promise<CitySuggestion[]> {
  const params = new URLSearchParams({ name, count: String(count), language, format: "json" });
  const data = await getJson<{ results?: GeocodingResult[] }>(`${GEOCODING_URL}?${params}`);
  return (data.results ?? []).map((place) => ({
    name: place.name,
    country: place.country_code ?? "",
    state: place.admin1,
    lat: place.latitude,
    lon: place.longitude,
  }));
}

// Las rutas reciben "q=ciudad" o "lat=..&lon=.."; aquí se resuelve a coordenadas.
async function resolvePlace(query: string, language: Language): Promise<Place> {
  const params = new URLSearchParams(query);
  const city = params.get("q");
  if (city) {
    const [first] = await searchOpenMeteoCities(city, language, 1);
    if (!first) throw new Error("CITY_NOT_FOUND");
    return { name: first.name, country: first.country, lat: first.lat, lon: first.lon };
  }
  return { name: "", country: "", lat: Number(params.get("lat")), lon: Number(params.get("lon")) };
}

async function fetchForecast(place: Place) {
  const params = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "pressure_msl",
      "cloud_cover",
      "visibility",
      "is_day",
    ].join(","),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    timezone: "auto",
    forecast_days: "5",
    wind_speed_unit: "ms",
  });
  return getJson<ForecastResponse>(`${FORECAST_URL}?${params}`);
}

export async function getOpenMeteoWeather(
  query: string,
  language: Language = "es",
): Promise<Weather> {
  const place = await resolvePlace(query, language);
  const data = await fetchForecast(place);
  const { current, daily, utc_offset_seconds: offset } = data;
  const condition = describeWeatherCode(current.weather_code, language, current.is_day === 1);

  return {
    city: place.name,
    country: place.country,
    temperature: current.temperature_2m,
    min: daily.temperature_2m_min[0],
    max: daily.temperature_2m_max[0],
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    description: condition.description,
    icon: condition.icon,
    windSpeed: current.wind_speed_10m,
    windDegrees: current.wind_direction_10m,
    pressure: Math.round(current.pressure_msl),
    visibility: current.visibility,
    clouds: current.cloud_cover,
    sunrise: localTimeToUnix(daily.sunrise[0], offset),
    sunset: localTimeToUnix(daily.sunset[0], offset),
    updatedAt: localTimeToUnix(current.time, offset),
  };
}

export async function getOpenMeteoForecast(
  query: string,
  language: Language = "es",
): Promise<ForecastDay[]> {
  const place = await resolvePlace(query, language);
  const { daily } = await fetchForecast(place);

  return daily.time.map((date, index) => {
    const condition = describeWeatherCode(daily.weather_code[index], language);
    return {
      date,
      min: daily.temperature_2m_min[index],
      max: daily.temperature_2m_max[index],
      description: condition.description,
      icon: condition.icon,
    };
  });
}
