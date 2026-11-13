/** @jest-environment node */
import { GET } from "./route";

describe("GET /api/health", () => {
  it("responde con el estado saludable", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
