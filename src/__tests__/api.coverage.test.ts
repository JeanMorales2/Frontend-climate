/** @jest-environment node */
import { NextRequest } from "next/server";

const getWeather = jest.fn();
const getForecast = jest.fn();
const searchCities = jest.fn();
jest.mock("@/features/weather/api", () => ({ getWeather: (...a: unknown[]) => getWeather(...a), getForecast: (...a: unknown[]) => getForecast(...a), searchCities: (...a: unknown[]) => searchCities(...a) }));

import * as weather from "@/app/api/weather/route";
import * as forecast from "@/app/api/forecast/route";
import * as geocode from "@/app/api/geocode/route";
import * as health from "@/app/api/health/route";

const request = (path: string) => new NextRequest(`http://localhost${path}`);
const exercise = (name: string, get: (r: NextRequest) => Promise<Response>, service: jest.Mock) => {
  describe(name, () => {
    beforeEach(() => service.mockReset());
    it("valida consultas y acepta ciudad, coordenadas e idioma", async () => {
      expect((await get(request("/api/x"))).status).toBe(400);
      expect((await get(request("/api/x?city=%20%20"))).status).toBe(400);
      expect((await get(request("/api/x?lat=1"))).status).toBe(400);
      service.mockResolvedValue({ ok: true });
      expect((await get(request("/api/x?city=San%20Jos%C3%A9&lang=en"))).status).toBe(200);
      expect(service).toHaveBeenLastCalledWith("q=San%20Jos%C3%A9", "en");
      expect((await get(request("/api/x?lat=1&lon=2"))).status).toBe(200);
      expect(service).toHaveBeenLastCalledWith("lat=1&lon=2", "es");
    });
    it.each([["CITY_NOT_FOUND", 404], ["INVALID_API_KEY", 401], ["other", 502]])("traduce %s", async (code, status) => {
      service.mockRejectedValue(new Error(code));
      expect((await get(request("/api/x?city=Lima"))).status).toBe(status);
    });
    it("traduce errores que no son Error", async () => {
      service.mockRejectedValue("nope");
      const response = await get(request("/api/x?city=Lima"));
      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({ code: "UPSTREAM_ERROR" });
    });
  });
};

exercise("weather", weather.GET, getWeather);
exercise("forecast", forecast.GET, getForecast);

describe("geocode y health", () => {
  beforeEach(() => searchCities.mockReset());
  it("expone módulos dinámicos y health", async () => {
    expect(weather.dynamic).toBe("force-dynamic"); expect(forecast.dynamic).toBe("force-dynamic");
    expect(geocode.dynamic).toBe("force-dynamic"); expect(health.dynamic).toBe("force-dynamic");
    expect(await health.GET().json()).toEqual({ status: "ok" });
  });
  it("valida, busca en ambos idiomas y traduce errores", async () => {
    expect((await geocode.GET(request("/api/geocode"))).status).toBe(400);
    searchCities.mockResolvedValue([{ name: "Madrid" }]);
    expect((await geocode.GET(request("/api/geocode?city=Madrid&lang=en"))).status).toBe(200);
    expect(searchCities).toHaveBeenCalledWith("Madrid", "en");
    for (const [value, expected] of [[new Error("CITY_NOT_FOUND"), 404], [new Error("INVALID_API_KEY"), 401], [new Error("x"), 502], [null, 502]]) {
      searchCities.mockRejectedValue(value);
      expect((await geocode.GET(request("/api/geocode?city=x"))).status).toBe(expected);
    }
  });
});
