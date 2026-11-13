"use client";

import { useQuery } from "@tanstack/react-query";
import type { Language, Weather } from "@/types/weather";

// Mientras la página siga abierta, el clima se vuelve a pedir cada 10 minutos para que
// la tarjeta y el fondo animado reflejen cambios (por ejemplo, si empieza a llover).
// React Query pausa el intervalo cuando la pestaña no está visible.
export const WEATHER_REFRESH_MS = 10 * 60 * 1000;

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) throw new Error(body.code ?? "UPSTREAM_ERROR");
  return body as T;
}

export function useWeather(city: string, language: Language = "es") {
  return useQuery({
    queryKey: ["weather", city, language],
    queryFn: () =>
      fetchApi<Weather>(`/api/weather?city=${encodeURIComponent(city)}&lang=${language}`),
    enabled: Boolean(city),
    refetchInterval: WEATHER_REFRESH_MS,
  });
}
