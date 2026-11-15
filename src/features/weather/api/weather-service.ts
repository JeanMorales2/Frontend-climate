import {
  getForecast as getOpenWeatherForecast,
  getWeather as getOpenWeatherWeather,
  searchOpenWeatherCities,
} from "./openweather";
import { getOpenMeteoForecast, getOpenMeteoWeather, searchOpenMeteoCities } from "./openmeteo";
import type { CitySuggestion, ForecastDay, Language, Weather } from "@/types/weather";

// Con OPENWEATHER_API_KEY se usa OpenWeather; sin ella, Open-Meteo, que no requiere clave.
function hasOpenWeatherKey() {
  return Boolean(process.env.OPENWEATHER_API_KEY?.trim());
}

export function getWeather(query: string, language: Language = "es"): Promise<Weather> {
  return hasOpenWeatherKey()
    ? getOpenWeatherWeather(query, language)
    : getOpenMeteoWeather(query, language);
}

export function getForecast(query: string, language: Language = "es"): Promise<ForecastDay[]> {
  return hasOpenWeatherKey()
    ? getOpenWeatherForecast(query, language)
    : getOpenMeteoForecast(query, language);
}

export function searchCities(city: string, language: Language = "es"): Promise<CitySuggestion[]> {
  return hasOpenWeatherKey()
    ? searchOpenWeatherCities(city)
    : searchOpenMeteoCities(city, language);
}
