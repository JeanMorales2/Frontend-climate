"use client";

import { useQuery } from "@tanstack/react-query";
import type { ForecastDay, Language } from "@/types/weather";

async function fetchForecast(url: string): Promise<ForecastDay[]> {
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) throw new Error(body.code ?? "UPSTREAM_ERROR");
  return body as ForecastDay[];
}

export function useForecast(city: string, language: Language = "es") {
  return useQuery({
    queryKey: ["forecast", city, language],
    queryFn: () => fetchForecast(`/api/forecast?city=${encodeURIComponent(city)}&lang=${language}`),
    enabled: Boolean(city),
  });
}
