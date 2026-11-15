import { render, screen } from "@testing-library/react";
import { WeatherDetails } from "@/features/weather/components/WeatherDetails";
import type { Weather } from "@/types/weather";

const weather: Weather = {
  city: "Managua",
  country: "NI",
  temperature: 29,
  min: 23,
  max: 31,
  feelsLike: 32,
  humidity: 72,
  description: "nubes dispersas",
  icon: "03d",
  windSpeed: 4,
  windDegrees: 135,
  pressure: 1009,
  visibility: 8500,
  clouds: 40,
  sunrise: 1_700_000_000,
  sunset: 1_700_043_200,
  updatedAt: 1_700_010_000,
};

describe("WeatherDetails: estructura animable", () => {
  it("conserva los nueve destinos de entrada y los gráficos accesibles", () => {
    const { container } = render(<WeatherDetails weather={weather} language="es" unit="celsius" />);

    expect(screen.getByRole("heading", { name: "Detalles de hoy" })).toBeInTheDocument();
    expect(container.querySelectorAll(".detail-grid > .detail-item")).toHaveLength(8);
    expect(container.querySelector(".detail-grid > .sun-arc-item")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Humedad 72%" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "SE 135°" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Recorrido solar" })).toBeInTheDocument();
  });
});
