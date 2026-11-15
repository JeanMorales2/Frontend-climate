import { NextRequest, NextResponse } from "next/server";
import { searchCities } from "@/features/weather/api";

export const dynamic = "force-dynamic";

const statusByCode: Record<string, number> = {
  CITY_NOT_FOUND: 404,
  INVALID_API_KEY: 401,
};

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim();
  const language = request.nextUrl.searchParams.get("lang") === "en" ? "en" : "es";
  if (!city) return NextResponse.json({ code: "INVALID_QUERY" }, { status: 400 });

  try {
    return NextResponse.json(await searchCities(city, language));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const code = message in statusByCode ? message : "UPSTREAM_ERROR";
    return NextResponse.json({ code }, { status: statusByCode[code] ?? 502 });
  }
}
