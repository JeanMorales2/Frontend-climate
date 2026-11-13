/** @jest-environment node */
import { NextRequest } from "next/server";
import { GET } from "./route";
describe("GET /api/geocode", () => {
  it("rechaza una consulta vacía", async () => {
    expect((await GET(new NextRequest("http://localhost/api/geocode"))).status).toBe(400);
  });
  it("indica cuando falta la clave", async () => {
    delete process.env.OPENWEATHER_API_KEY;
    expect((await GET(new NextRequest("http://localhost/api/geocode?city=Lima"))).status).toBe(401);
  });

  it("devuelve sugerencias limitadas y normalizadas", async () => {
    process.env.OPENWEATHER_API_KEY = "test-key";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { name: "Madrid", country: "ES", state: "Madrid", lat: 1, lon: 2, extra: "omitido" },
      ],
    });
    const response = await GET(new NextRequest("http://localhost/api/geocode?city=Madrid"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { name: "Madrid", country: "ES", state: "Madrid", lat: 1, lon: 2 },
    ]);
  });

  it.each([
    [401, 401, "INVALID_API_KEY"],
    [404, 404, "CITY_NOT_FOUND"],
    [503, 502, "UPSTREAM_ERROR"],
  ])("normaliza el error upstream %s", async (upstreamStatus, expectedStatus, code) => {
    process.env.OPENWEATHER_API_KEY = "test-key";
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: upstreamStatus });
    const response = await GET(new NextRequest("http://localhost/api/geocode?city=Unknown"));
    expect(response.status).toBe(expectedStatus);
    expect(await response.json()).toEqual({ code });
  });

  it("devuelve 502 cuando falla la conexión", async () => {
    process.env.OPENWEATHER_API_KEY = "test-key";
    global.fetch = jest.fn().mockRejectedValue(new Error("offline"));
    expect((await GET(new NextRequest("http://localhost/api/geocode?city=Lima"))).status).toBe(502);
  });
});
