/** @jest-environment node */
import { NextRequest } from "next/server";
import { GET } from "./route";
jest.mock("@/lib/weather-service", () => ({ searchCities: jest.fn() }));
import { searchCities } from "@/lib/weather-service";

const request = (url: string) => new NextRequest(url);

describe("GET /api/geocode", () => {
  beforeEach(() => jest.clearAllMocks());

  it("rechaza una consulta vacía", async () => {
    expect((await GET(request("http://localhost/api/geocode"))).status).toBe(400);
    expect(searchCities).not.toHaveBeenCalled();
  });

  it("devuelve las sugerencias del proveedor", async () => {
    const places = [{ name: "Madrid", country: "ES", state: "Madrid", lat: 1, lon: 2 }];
    (searchCities as jest.Mock).mockResolvedValue(places);
    const response = await GET(request("http://localhost/api/geocode?city=Madrid&lang=en"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(places);
    expect(searchCities).toHaveBeenCalledWith("Madrid", "en");
  });

  it.each([
    ["INVALID_API_KEY", 401, "INVALID_API_KEY"],
    ["CITY_NOT_FOUND", 404, "CITY_NOT_FOUND"],
    ["UPSTREAM_ERROR", 502, "UPSTREAM_ERROR"],
    ["offline", 502, "UPSTREAM_ERROR"],
  ])("traduce el error %s", async (message, status, code) => {
    (searchCities as jest.Mock).mockRejectedValue(new Error(message));
    const response = await GET(request("http://localhost/api/geocode?city=Lima"));
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ code });
  });

  it("trata un rechazo sin Error como fallo del proveedor", async () => {
    (searchCities as jest.Mock).mockRejectedValue("sin detalle");
    expect((await GET(request("http://localhost/api/geocode?city=Lima"))).status).toBe(502);
  });
});
