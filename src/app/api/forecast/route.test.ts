/** @jest-environment node */
import { NextRequest } from "next/server";
import { GET } from "./route";
jest.mock("@/lib/weather-service", () => ({ getForecast: jest.fn() }));
import { getForecast } from "@/lib/weather-service";
describe("GET /api/forecast", () => {
  it("rechaza una ubicación vacía", async () => {
    expect((await GET(new NextRequest("http://localhost/api/forecast"))).status).toBe(400);
  });
  it("responde con el pronóstico", async () => {
    (getForecast as jest.Mock).mockResolvedValue([]);
    expect((await GET(new NextRequest("http://localhost/api/forecast?city=Lima"))).status).toBe(
      200,
    );
  });

  it("admite coordenadas y normaliza errores del proveedor", async () => {
    (getForecast as jest.Mock).mockResolvedValueOnce([]);
    expect((await GET(new NextRequest("http://localhost/api/forecast?lat=1&lon=2"))).status).toBe(
      200,
    );
    expect(getForecast).toHaveBeenCalledWith("lat=1&lon=2", "es");
    (getForecast as jest.Mock).mockRejectedValueOnce(new Error("INVALID_API_KEY"));
    expect((await GET(new NextRequest("http://localhost/api/forecast?city=Lima"))).status).toBe(
      401,
    );
    (getForecast as jest.Mock).mockRejectedValueOnce(new Error("OTHER"));
    expect((await GET(new NextRequest("http://localhost/api/forecast?city=Lima"))).status).toBe(
      502,
    );
  });

  it("rechaza coordenadas incompletas", async () => {
    expect((await GET(new NextRequest("http://localhost/api/forecast?lat=1"))).status).toBe(400);
  });

  it("reenvía el idioma solicitado", async () => {
    (getForecast as jest.Mock).mockResolvedValue([]);
    await GET(new NextRequest("http://localhost/api/forecast?city=London&lang=en"));
    expect(getForecast).toHaveBeenCalledWith("q=London", "en");
  });
});
