import { NextRequest, NextResponse } from "next/server";
import { getWeather } from "@/lib/openweather";
export const dynamic = "force-dynamic";
function failure(error: unknown) {
  const code = error instanceof Error ? error.message : "UPSTREAM_ERROR";
  const status = code === "CITY_NOT_FOUND" ? 404 : code === "INVALID_API_KEY" ? 401 : 502;
  return NextResponse.json({ code }, { status });
}
export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city");
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");
  const language = request.nextUrl.searchParams.get("lang") === "en" ? "en" : "es";
  if ((!city && (!lat || !lon)) || (city !== null && !city.trim()))
    return NextResponse.json({ code: "INVALID_QUERY" }, { status: 400 });
  const query = city
    ? `q=${encodeURIComponent(city.trim())}`
    : `lat=${encodeURIComponent(lat!)}&lon=${encodeURIComponent(lon!)}`;
  try {
    return NextResponse.json(await getWeather(query, language));
  } catch (error) {
    return failure(error);
  }
}
