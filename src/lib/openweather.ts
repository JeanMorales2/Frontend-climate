import { mapForecast, mapWeather } from "@/lib/mappers";
import type { CitySuggestion, ForecastDay, Language, Weather } from "@/types/weather";

export async function requestWeather(path: string, language: Language = "es"): Promise<unknown> {
  const key = process.env.OPENWEATHER_API_KEY;
  // La clave solo se consulta en el servidor, dentro de los route handlers.
  if (!key) throw new Error("INVALID_API_KEY");
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(
    `https://api.openweathermap.org${path}${separator}appid=${encodeURIComponent(key)}&units=metric&lang=${language}`,
    { next: { revalidate: 600 } },
  );
  if (!response.ok) {
    // OpenWeather usa 404 para ciudades inexistentes; exponemos un código estable al cliente.
    if (response.status === 404) throw new Error("CITY_NOT_FOUND");
    if (response.status === 401) throw new Error("INVALID_API_KEY");
    throw new Error("UPSTREAM_ERROR");
  }
  return response.json();
}

export async function getWeather(query: string, language: Language = "es"): Promise<Weather> {
  return mapWeather(
    (await requestWeather(`/data/2.5/weather?${query}`, language)) as Parameters<
      typeof mapWeather
    >[0],
  );
}

export async function getForecast(
  query: string,
  language: Language = "es",
): Promise<ForecastDay[]> {
  return mapForecast(
    (await requestWeather(`/data/2.5/forecast?${query}`, language)) as Parameters<
      typeof mapForecast
    >[0],
  );
}

export async function searchOpenWeatherCities(city: string): Promise<CitySuggestion[]> {
  const places = (await requestWeather(
    `/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5`,
  )) as CitySuggestion[];
  return places.map(({ name, country, state, lat, lon }) => ({ name, country, state, lat, lon }));
}
