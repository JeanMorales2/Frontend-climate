import { mapForecast, mapWeather } from "./mappers";
import { formatDate, formatDay, formatTemperature, formatWindDirection } from "@/utils/format";

const raw = {
  name: "Madrid",
  sys: { country: "ES", sunrise: 100, sunset: 200 },
  main: { temp: 20, feels_like: 19, temp_min: 13, temp_max: 25, humidity: 60, pressure: 1012 },
  weather: [{ description: "cielo claro", icon: "01d" }],
  wind: { speed: 3, deg: 45 },
  clouds: { all: 12 },
  visibility: 10000,
  dt: 1,
};

describe("mapeo y formato meteorológico", () => {
  it("normaliza una respuesta meteorológica", () => {
    expect(mapWeather(raw)).toMatchObject({
      city: "Madrid",
      temperature: 20,
      humidity: 60,
      windDegrees: 45,
      visibility: 10000,
    });
  });

  it("agrupa los extremos diarios del pronóstico y limita a cinco días", () => {
    const list = Array.from({ length: 6 }, (_, index) => ({
      dt_txt: "2026-01-0" + (index + 1) + " 09:00:00",
      main: { temp_min: 4, temp_max: 8 },
      weather: [{ description: "nubes", icon: "02d" }],
    }));
    list.splice(1, 0, {
      dt_txt: "2026-01-01 12:00:00",
      main: { temp_min: 2, temp_max: 10 },
      weather: [{ description: "nubes", icon: "02d" }],
    });
    expect(mapForecast({ list })).toHaveLength(5);
    expect(mapForecast({ list })[0]).toMatchObject({ min: 2, max: 10 });
  });

  it("usa valores de reserva si faltan campos", () => {
    expect(
      mapWeather({
        ...raw,
        weather: [],
        wind: { speed: 2 },
        clouds: undefined,
        visibility: undefined,
      }),
    ).toMatchObject({
      description: "Clima no disponible",
      icon: "01d",
      windDegrees: 0,
      visibility: 0,
      clouds: 0,
    });
    expect(
      mapForecast({
        list: [{ dt_txt: "2026-01-01 09:00:00", main: { temp_min: 1, temp_max: 2 }, weather: [] }],
      })[0],
    ).toMatchObject({ description: "", icon: "01d" });
  });

  it("formatea temperatura, día, fecha y dirección del viento", () => {
    expect(formatTemperature(0, "fahrenheit")).toBe("32°");
    expect(formatTemperature(0)).toBe("0°");
    expect(formatDay("2026-01-01")).toBeTruthy();
    expect(formatDate(1, "en")).toBeTruthy();
    expect(formatWindDirection(360, "es")).toBe("N");
    expect(formatWindDirection(270, "en")).toBe("W");
  });
});
