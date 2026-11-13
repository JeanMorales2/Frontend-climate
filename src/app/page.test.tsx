import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import { Providers } from "./providers";
import { usePreferences } from "@/store/preferences";

global.fetch = jest.fn();
const days = [
  { date: "2026-11-13", min: 10, max: 18, description: "lluvia ligera", icon: "10d" },
  { date: "2026-11-14", min: 8, max: 16, description: "cielo claro", icon: "01d" },
];
const current = {
  city: "Madrid",
  country: "ES",
  temperature: 22,
  min: 13,
  max: 25,
  feelsLike: 21,
  humidity: 48,
  description: "cielo claro",
  icon: "01d",
  windSpeed: 2.5,
  windDegrees: 90,
  pressure: 1012,
  visibility: 10000,
  clouds: 20,
  sunrise: 100,
  sunset: 200,
  updatedAt: 1,
};

describe("consulta del clima", () => {
  beforeEach(() => {
    localStorage.clear();
    usePreferences.setState({ unit: "celsius", theme: "system", language: "es", recent: [] });
    (fetch as jest.Mock).mockReset();
    (fetch as jest.Mock).mockImplementation(async (url: string) =>
      url.includes("forecast")
        ? { ok: true, json: async () => days }
        : { ok: true, json: async () => current },
    );
  });

  it("muestra temperatura, humedad y descripción tras una búsqueda exitosa", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <Home />
      </Providers>,
    );
    await user.type(screen.getByLabelText("Busca una ciudad"), "Madrid");
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(await screen.findByLabelText("22°")).toBeInTheDocument();
    expect(document.querySelector(".range")).toHaveTextContent("13°");
    expect(document.querySelector(".range")).toHaveTextContent("25°");
    expect(document.querySelector(".description")).toHaveTextContent("Cielo claro");
    expect(screen.getByRole("img", { name: "Humedad 48%" })).toBeInTheDocument();
  });

  it("muestra un error cuando la ciudad no existe", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ code: "CITY_NOT_FOUND" }),
    });
    const user = userEvent.setup();
    render(
      <Providers>
        <Home />
      </Providers>,
    );
    await user.type(screen.getByLabelText("Busca una ciudad"), "Atlantis");
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No encontramos esa ciudad");
  });

  it("el input refleja lo escrito y el botón dispara la búsqueda", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <Home />
      </Providers>,
    );
    const input = screen.getByLabelText("Busca una ciudad");
    await user.type(input, "Lima");
    expect(input).toHaveValue("Lima");
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/weather?city=Lima&lang=es"));
  });

  it("mantiene deshabilitada la búsqueda sin ciudad y permite alternar unidades", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <Home />
      </Providers>,
    );
    expect(screen.getByRole("button", { name: "Buscar" })).toBeDisabled();
    await user.type(screen.getByLabelText("Busca una ciudad"), "Madrid");
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    await screen.findByLabelText("22°");
    await user.click(screen.getAllByRole("button", { name: "Cambiar unidad" })[0]);
    expect(await screen.findByLabelText("72°")).toBeInTheDocument();
  });

  it("cambia el idioma y aplica el tema al documento", async () => {
    render(
      <Providers>
        <Home />
      </Providers>,
    );
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(await screen.findByText("LOCAL FORECAST")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Start your day with the weather." }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(document.querySelector(".shell")).toHaveClass("theme-dark");
    expect(document.documentElement).toHaveClass("theme-dark");
    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(document.documentElement).toHaveClass("theme-light");
    fireEvent.click(screen.getByRole("button", { name: "System" }));
    expect(document.documentElement).toHaveClass("theme-system");
  });

  it("muestra mínimo y máximo con descripción en cada tarjeta del pronóstico", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <Home />
      </Providers>,
    );
    await user.type(screen.getByLabelText("Busca una ciudad"), "Madrid");
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    const forecast = await screen.findByRole("heading", { name: "Próximos días" });
    expect(forecast).toBeInTheDocument();
    const cards = document.querySelectorAll(".forecast-day");
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector("span")).toHaveTextContent("vie");
    expect(cards[0]).toHaveTextContent("Máx 18°");
    expect(cards[0]).toHaveTextContent("Mín 10°");
    expect(cards[0]).toHaveTextContent("Lluvia ligera");
    expect(cards[0].querySelector(".temperature-range i")).toBeInTheDocument();
  });

  it("enfoca el buscador con el atajo de barra", async () => {
    render(
      <Providers>
        <Home />
      </Providers>,
    );
    fireEvent.keyDown(window, { key: "/" });
    expect(screen.getByLabelText("Busca una ciudad")).toHaveFocus();
    expect(document.querySelector(".search-box .search-shortcut kbd")).toHaveTextContent("/");
  });

  it("desplaza hasta el resultado en móvil cuando no está visible", async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    const scrollIntoView = jest.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
    const bounds = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return { top: 900, bottom: 1200, left: 0, right: 300, width: 300, height: 300, x: 0, y: 900, toJSON: () => ({}) } as DOMRect;
    });
    const user = userEvent.setup();
    render(<Providers><Home /></Providers>);
    await user.type(screen.getByLabelText("Busca una ciudad"), "Madrid");
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    await waitFor(() => expect(document.querySelector(".results")).toBeInTheDocument());
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" }));
    bounds.mockRestore();
    window.matchMedia = originalMatchMedia;
  });

  it("alterna entre Celsius y Fahrenheit desde el control", async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <Home />
      </Providers>,
    );
    const controls = screen.getByRole("group", { name: "Cambiar unidad" });
    expect(controls.querySelector('[aria-pressed="true"]')).toHaveTextContent("°C");
    await user.click(screen.getByRole("button", { name: "°F" }));
    expect(controls.querySelector('[aria-pressed="true"]')).toHaveTextContent("°F");
  });
});
