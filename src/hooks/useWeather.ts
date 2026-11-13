"use client";

import { useQuery } from "@tanstack/react-query";
import type { Language, Weather } from "@/types/weather";

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
  });
}
