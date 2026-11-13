export type Unit = "celsius" | "fahrenheit";
export type Theme = "light" | "dark" | "system";
export type Language = "es" | "en";

export type Weather = {
  city: string;
  country: string;
  temperature: number;
  min: number;
  max: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDegrees: number;
  pressure: number;
  visibility: number;
  clouds: number;
  sunrise: number;
  sunset: number;
  updatedAt: number;
};

export type ForecastDay = {
  date: string;
  min: number;
  max: number;
  description: string;
  icon: string;
};

export type CitySuggestion = {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
};

export type ApiError = { code: string; message?: string };
