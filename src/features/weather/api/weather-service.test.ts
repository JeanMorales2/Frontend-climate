import { getForecast, getWeather, searchCities } from "./weather-service";
import * as openWeather from "./openweather";
import * as openMeteo from "./openmeteo";

jest.mock("./openweather", () => ({
  getWeather: jest.fn().mockResolvedValue("openweather"),
  getForecast: jest.fn().mockResolvedValue("openweather"),
  searchOpenWeatherCities: jest.fn().mockResolvedValue("openweather"),
}));
jest.mock("./openmeteo", () => ({
  getOpenMeteoWeather: jest.fn().mockResolvedValue("openmeteo"),
  getOpenMeteoForecast: jest.fn().mockResolvedValue("openmeteo"),
  searchOpenMeteoCities: jest.fn().mockResolvedValue("openmeteo"),
}));

describe("selección del proveedor de clima", () => {
  const originalKey = process.env.OPENWEATHER_API_KEY;
  afterAll(() => {
    if (originalKey === undefined) delete process.env.OPENWEATHER_API_KEY;
    else process.env.OPENWEATHER_API_KEY = originalKey;
  });

  it("usa OpenWeather cuando hay API key", async () => {
    process.env.OPENWEATHER_API_KEY = "server-secret";
    await expect(getWeather("q=Lima", "en")).resolves.toBe("openweather");
    await expect(getForecast("q=Lima")).resolves.toBe("openweather");
    await expect(searchCities("Lima")).resolves.toBe("openweather");
    expect(openWeather.getWeather).toHaveBeenCalledWith("q=Lima", "en");
  });

  it.each([undefined, "   "])("usa Open-Meteo cuando la key es %p", async (key) => {
    if (key === undefined) delete process.env.OPENWEATHER_API_KEY;
    else process.env.OPENWEATHER_API_KEY = key;
    await expect(getWeather("q=Lima")).resolves.toBe("openmeteo");
    await expect(getForecast("q=Lima", "en")).resolves.toBe("openmeteo");
    await expect(searchCities("Lima", "en")).resolves.toBe("openmeteo");
    expect(openMeteo.searchOpenMeteoCities).toHaveBeenCalledWith("Lima", "en");
  });
});
