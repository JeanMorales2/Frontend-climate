import { getForecast, getWeather, requestWeather } from "./openweather";

const rawCurrent = {
  name: "Lima",
  sys: { country: "PE", sunrise: 100, sunset: 200 },
  main: { temp: 20, feels_like: 19, temp_min: 13, temp_max: 25, humidity: 60, pressure: 1012 },
  weather: [{ description: "nubes", icon: "03d" }],
  wind: { speed: 2 },
  dt: 1,
};

describe("cliente OpenWeather", () => {
  const originalKey = process.env.OPENWEATHER_API_KEY;
  beforeEach(() => {
    process.env.OPENWEATHER_API_KEY = "server-secret";
    global.fetch = jest.fn();
  });
  afterAll(() => {
    if (originalKey === undefined) delete process.env.OPENWEATHER_API_KEY;
    else process.env.OPENWEATHER_API_KEY = originalKey;
  });

  it("requiere la clave del servidor y traduce errores HTTP", async () => {
    delete process.env.OPENWEATHER_API_KEY;
    await expect(requestWeather("/data/2.5/weather")).rejects.toThrow("INVALID_API_KEY");
    process.env.OPENWEATHER_API_KEY = "server-secret";
    for (const [status, code] of [
      [404, "CITY_NOT_FOUND"],
      [401, "INVALID_API_KEY"],
      [500, "UPSTREAM_ERROR"],
    ] as const) {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status });
      await expect(requestWeather("/data/2.5/weather")).rejects.toThrow(code);
    }
  });

  it("solicita y normaliza las respuestas actuales y del pronóstico", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => rawCurrent })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ list: [] }) });
    expect(await getWeather("q=Lima")).toMatchObject({ city: "Lima", temperature: 20 });
    expect(await getForecast("q=Lima")).toEqual([]);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("appid=server-secret"),
      expect.any(Object),
    );
  });
});
