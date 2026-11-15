"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import type { CitySuggestion } from "@/types/weather";

export function useCitySuggestions(value: string) {
  const query = useDebounce(value.trim(), 300);
  return useQuery({
    queryKey: ["suggestions", query],
    enabled: query.length >= 2,
    staleTime: 60_000,
    queryFn: async () => {
      const response = await fetch(`/api/geocode?city=${encodeURIComponent(query)}`);
      if (!response.ok) return [] as CitySuggestion[];
      return response.json() as Promise<CitySuggestion[]>;
    },
  });
}
