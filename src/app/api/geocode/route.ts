import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim();
  if (!city) return NextResponse.json({ code: "INVALID_QUERY" }, { status: 400 });
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return NextResponse.json({ code: "INVALID_API_KEY" }, { status: 401 });
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${encodeURIComponent(key)}`,
    );
    if (!response.ok) {
      const code =
        response.status === 401
          ? "INVALID_API_KEY"
          : response.status === 404
            ? "CITY_NOT_FOUND"
            : "UPSTREAM_ERROR";
      return NextResponse.json(
        { code },
        { status: code === "UPSTREAM_ERROR" ? 502 : response.status },
      );
    }
    const places = (await response.json()) as {
      name: string;
      country: string;
      state?: string;
      lat: number;
      lon: number;
    }[];
    return NextResponse.json(
      places.map(({ name, country, state, lat, lon }) => ({ name, country, state, lat, lon })),
    );
  } catch {
    return NextResponse.json({ code: "UPSTREAM_ERROR" }, { status: 502 });
  }
}
