/** @jest-environment node */
import { NextRequest } from "next/server";
import { GET } from "./route";
jest.mock("@/lib/weather-service", () => ({ getWeather: jest.fn() }));
import { getWeather } from "@/lib/weather-service";
const request = (url: string) => new NextRequest(url);
describe("GET /api/weather", () => {
  beforeEach(() => jest.clearAllMocks());
  it("rechaza consultas vacías", async () => {
    const response = await GET(request("http://localhost/api/weather?city=%20"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: "INVALID_QUERY" });
  });
  it("devuelve el clima normalizado", async () => {
    (getWeather as jest.Mock).mockResolvedValue({ city: "Lima" });
    const response = await GET(request("http://localhost/api/weather?city=Lima"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ city: "Lima" });
  });
  it("mapea errores de ciudad", async () => {
    (getWeather as jest.Mock).mockRejectedValue(new Error("CITY_NOT_FOUND"));
    expect((await GET(request("http://localhost/api/weather?city=Falsa"))).status).toBe(404);
  });

  it("permite buscar por coordenadas y mapea los demás errores", async () => {
    (getWeather as jest.Mock).mockResolvedValueOnce({ city: "Lima" });
    expect((await GET(request("http://localhost/api/weather?lat=1&lon=2"))).status).toBe(200);
    expect(getWeather).toHaveBeenCalledWith("lat=1&lon=2", "es");
    (getWeather as jest.Mock).mockRejectedValueOnce(new Error("INVALID_API_KEY"));
    expect((await GET(request("http://localhost/api/weather?city=Lima"))).status).toBe(401);
    (getWeather as jest.Mock).mockRejectedValueOnce(new Error("UNEXPECTED"));
    expect((await GET(request("http://localhost/api/weather?city=Lima"))).status).toBe(502);
  });

  it("valida coordenadas incompletas", async () => {
    expect((await GET(request("http://localhost/api/weather?lat=1"))).status).toBe(400);
  });

  it("reenvía el idioma de consulta admitido", async () => {
    (getWeather as jest.Mock).mockResolvedValue({ city: "London" });
    await GET(request("http://localhost/api/weather?city=London&lang=en"));
    expect(getWeather).toHaveBeenCalledWith("q=London", "en");
  });
});
