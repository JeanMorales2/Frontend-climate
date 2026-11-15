import { act, renderHook, waitFor } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useCitySuggestions } from "@/features/search";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWeather, WEATHER_REFRESH_MS } from "./useWeather";
import { useForecast } from "./useForecast";

describe("hooks", () => {
  it("aplaza el valor hasta que vence el debounce", async () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 250), {
      initialProps: { value: "Ma" },
    });
    rerender({ value: "Madrid" });
    act(() => jest.advanceTimersByTime(250));
    expect(result.current).toBe("Madrid");
    jest.useRealTimers();
  });

  it("observa el estado inicial de media query", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 700px)"));
    expect(result.current).toBe(false);
    expect(window.matchMedia).toHaveBeenCalled();
  });

  it("no consulta sugerencias con menos de dos caracteres y obtiene sugerencias válidas", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ name: "Madrid", country: "ES", lat: 1, lon: 2 }],
    });
    global.fetch = fetchMock;
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result, rerender } = renderHook(({ value }) => useCitySuggestions(value), {
      initialProps: { value: "M" },
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    expect(result.current.fetchStatus).toBe("idle");
    rerender({ value: "Madrid" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(result.current.data?.[0].name).toBe("Madrid"));
    global.fetch = jest.fn();
  });

  it("mantiene deshabilitadas las consultas vacías y propaga errores de los endpoints", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, json: async () => ({ code: "CITY_NOT_FOUND" }) });
    const disabledWeather = renderHook(() => useWeather(""), { wrapper });
    const disabledForecast = renderHook(() => useForecast(""), { wrapper });
    expect(disabledWeather.result.current.fetchStatus).toBe("idle");
    expect(disabledForecast.result.current.fetchStatus).toBe("idle");
    const weather = renderHook(() => useWeather("Atlantis"), { wrapper });
    await waitFor(() => expect(weather.result.current.error?.message).toBe("CITY_NOT_FOUND"));
    const forecast = renderHook(() => useForecast("Atlantis"), { wrapper });
    await waitFor(() => expect(forecast.result.current.error?.message).toBe("CITY_NOT_FOUND"));
  });

  it("vuelve a pedir el clima y el pronóstico cada diez minutos", async () => {
    jest.useFakeTimers();
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
    global.fetch = fetchMock;
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    renderHook(
      () => {
        useWeather("Managua");
        useForecast("Managua");
      },
      { wrapper },
    );
    await act(async () => {
      await jest.advanceTimersByTimeAsync(0);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(WEATHER_REFRESH_MS);
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls.slice(2).map(([url]) => url)).toEqual([
      "/api/weather?city=Managua&lang=es",
      "/api/forecast?city=Managua&lang=es",
    ]);

    client.clear();
    jest.useRealTimers();
    global.fetch = jest.fn();
  });
});
