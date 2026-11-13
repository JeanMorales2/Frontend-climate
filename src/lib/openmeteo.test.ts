import {
  describeWeatherCode,
  getOpenMeteoForecast,
  getOpenMeteoWeather,
  localTimeToUnix,
  searchOpenMeteoCities,
} from "./openmeteo";

const geocoding = {
  results: [
    {
      name: "Managua",
      latitude: 12.13,
      longitude: -86.25,
      country_code: "NI",
      admin1: "Departamento de Managua",
    },
  ],
};

const forecast = {
  utc_offset_seconds: -21600,
  current: {
    time: "2026-11-13T17:00",
    temperature_2m: 29.1,
    relative_humidity_2m: 79,
    apparent_temperature: 34.7,
    weather_code: 61,
    wind_speed_10m: 2.3,
    wind_direction_10m: 89,
    pressure_msl: 1008.4,
    cloud_cover: 8,
    visibility: 24140,
    is_day: 0,
  },
  daily: {
    time: ["2026-11-13", "2026-11-14"],
    weather_code: [61, 0],
    temperature_2m_max: [31, 32],
    temperature_2m_min: [23, 22],
    sunrise: ["2026-11-13T05:50", "2026-11-14T05:51"],
    sunset: ["2026-11-13T17:22", "2026-11-14T17:22"],
  },
};

const ok = (body: unknown) => ({ ok: true, json: async () => body });

describe("cliente Open-Meteo", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("traduce los códigos WMO a descripción e ícono", () => {
    expect(describeWeatherCode(0, "es")).toEqual({ description: "cielo despejado", icon: "01d" });
    expect(describeWeatherCode(95, "en", false)).toEqual({
      description: "thunderstorm",
      icon: "11n",
    });
    // Un código desconocido cae en "nublado" en lugar de romper la tarjeta.
    expect(describeWeatherCode(1234, "es").icon).toBe("04d");
  });

  it("convierte la hora local de la respuesta a segundos Unix", () => {
    expect(localTimeToUnix("2026-11-13T17:00", -21600)).toBe(
      Date.parse("2026-11-13T23:00:00Z") / 1000,
    );
  });

  it("busca ciudades sin necesitar API key", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(ok(geocoding));
    await expect(searchOpenMeteoCities("Managua")).resolves.toEqual([
      { name: "Managua", country: "NI", state: "Departamento de Managua", lat: 12.13, lon: -86.25 },
    ]);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("geocoding-api.open-meteo.com");
    expect(url).toContain("name=Managua");
    expect(url).not.toContain("appid");
  });

  it("devuelve una lista vacía cuando no hay coincidencias", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(ok({}));
    await expect(searchOpenMeteoCities("zzzz")).resolves.toEqual([]);
  });

  it("arma el clima actual a partir de la ciudad", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(ok(geocoding))
      .mockResolvedValueOnce(ok(forecast));

    const weather = await getOpenMeteoWeather("q=Managua", "es");

    expect(weather).toMatchObject({
      city: "Managua",
      country: "NI",
      temperature: 29.1,
      min: 23,
      max: 31,
      feelsLike: 34.7,
      humidity: 79,
      description: "lluvia ligera",
      icon: "10n",
      windSpeed: 2.3,
      windDegrees: 89,
      pressure: 1008,
      clouds: 8,
      updatedAt: localTimeToUnix("2026-11-13T17:00", -21600),
    });
    const forecastUrl = (global.fetch as jest.Mock).mock.calls[1][0] as string;
    expect(forecastUrl).toContain("latitude=12.13");
    expect(forecastUrl).toContain("wind_speed_unit=ms");
  });

  it("consulta directo por coordenadas sin geocodificar", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(ok(forecast));
    const weather = await getOpenMeteoWeather("lat=12.13&lon=-86.25", "en");
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(weather.description).toBe("light rain");
  });

  it("indica ciudad no encontrada cuando la búsqueda no devuelve resultados", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(ok({ results: [] }));
    await expect(getOpenMeteoWeather("q=Ciudad Falsa")).rejects.toThrow("CITY_NOT_FOUND");
  });

  it("propaga un error genérico si el servicio falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    await expect(searchOpenMeteoCities("Lima")).rejects.toThrow("UPSTREAM_ERROR");
  });

  it("arma el pronóstico diario", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(ok(geocoding))
      .mockResolvedValueOnce(ok(forecast));

    await expect(getOpenMeteoForecast("q=Managua")).resolves.toEqual([
      { date: "2026-11-13", min: 23, max: 31, description: "lluvia ligera", icon: "10d" },
      { date: "2026-11-14", min: 22, max: 32, description: "cielo despejado", icon: "01d" },
    ]);
  });
});
