import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./search/SearchBar";
import { RecentSearches } from "./search/RecentSearches";
import { CurrentWeather } from "./weather/CurrentWeather";
import { WeatherDetails } from "./weather/WeatherDetails";
import { WeatherIcon } from "./weather/WeatherIcon";
import { HumidityRing } from "./weather/HumidityRing";
import { SunArc } from "./weather/SunArc";
import { Forecast } from "./weather/Forecast";
import { WeatherBackground } from "./background/WeatherBackground";
import { EmptyState } from "./feedback/EmptyState";
import { ErrorState } from "./feedback/ErrorState";
import { Skeletons } from "./feedback/Skeletons";
import { PreferenceControls } from "./ui/PreferenceControls";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { Card } from "./ui/Card";
import { useCitySuggestions } from "@/hooks/useCitySuggestions";
import type { Weather } from "@/types/weather";

jest.mock("@/hooks/useCitySuggestions");

const weather: Weather = {
  city: "Madrid",
  country: "ES",
  temperature: 20,
  min: 13,
  max: 25,
  feelsLike: 18,
  humidity: 54,
  description: "cielo claro",
  icon: "01d",
  windSpeed: 3,
  windDegrees: 270,
  pressure: 1012,
  visibility: 10000,
  clouds: 10,
  sunrise: 100,
  sunset: 200,
  updatedAt: 1,
};

describe("componentes de interfaz", () => {
  beforeEach(() => (useCitySuggestions as jest.Mock).mockReturnValue({ data: [] }));

  it("envía la búsqueda con Enter y limpia el texto", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<SearchBar language="es" onSearch={onSearch} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "Madrid{Enter}");
    expect(onSearch).toHaveBeenCalledWith("Madrid");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(input).toHaveValue("");
  });

  it("cierra sugerencias con Escape, clic afuera y al buscar", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    (useCitySuggestions as jest.Mock).mockReturnValue({
      data: [{ name: "Lima", country: "PE", lat: 1, lon: 2 }],
    });
    render(
      <>
        <SearchBar language="es" onSearch={onSearch} />
        <button type="button">Fuera</button>
      </>,
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "Lim");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fuera" }));
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(input);
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(onSearch).toHaveBeenCalledWith("Lim");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("permite elegir sugerencias con flechas y Enter", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    (useCitySuggestions as jest.Mock).mockReturnValue({
      data: [
        { name: "Madrid", country: "ES", lat: 1, lon: 2 },
        { name: "Madrid", state: "New Mexico", country: "US", lat: 3, lon: 4 },
      ],
    });
    render(<SearchBar language="es" onSearch={onSearch} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "Mad");
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onSearch).toHaveBeenCalledWith("Madrid, New Mexico, US");
  });

  it("maneja Escape, flecha arriba, atajos de enfoque y selección con mouse", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    (useCitySuggestions as jest.Mock).mockReturnValue({
      data: [{ name: "Lima", country: "PE", lat: 1, lon: 2 }],
    });
    render(<SearchBar language="es" onSearch={onSearch} />);
    const input = screen.getByRole("combobox");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true }));
    expect(input).toHaveFocus();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    await user.type(input, "Lim");
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveAttribute("aria-activedescendant", "suggestion-0");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(screen.getByRole("option"));
    expect(onSearch).toHaveBeenCalledWith("Lima, PE");
  });

  it("selecciona, quita y limpia búsquedas recientes", () => {
    const onSelect = jest.fn();
    const onRemove = jest.fn();
    const onClear = jest.fn();
    render(
      <RecentSearches
        cities={["Lima"]}
        language="es"
        onSelect={onSelect}
        onRemove={onRemove}
        onClear={onClear}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Lima" }));
    fireEvent.click(screen.getByRole("button", { name: "Quitar Lima" }));
    fireEvent.click(screen.getByRole("button", { name: "Borrar recientes" }));
    expect(onSelect).toHaveBeenCalledWith("Lima");
    expect(onRemove).toHaveBeenCalledWith("Lima");
    expect(onClear).toHaveBeenCalled();
    const { container } = render(
      <RecentSearches
        cities={[]}
        language="en"
        onSelect={onSelect}
        onRemove={onRemove}
        onClear={onClear}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("presenta clima, cambia la unidad y muestra los detalles gráficos", () => {
    const onToggleUnit = jest.fn();
    render(
      <>
        <CurrentWeather
          weather={weather}
          language="es"
          unit="celsius"
          onToggleUnit={onToggleUnit}
        />
        <WeatherDetails weather={weather} language="es" unit="fahrenheit" />
      </>,
    );
    expect(screen.getByLabelText("20°")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cambiar unidad" }));
    expect(onToggleUnit).toHaveBeenCalled();
    expect(screen.getByLabelText("64°")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Humedad 54%" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "O 270°" })).toBeInTheDocument();
  });

  it("muestra días de pronóstico y el estado sin datos", () => {
    const day = { date: "2026-01-01", min: 2, max: 9, description: "sol", icon: "01d" };
    const { rerender } = render(<Forecast days={[day]} language="en" unit="fahrenheit" />);
    expect(screen.getByText("Max 48°")).toBeInTheDocument();
    rerender(<Forecast days={[]} language="es" unit="celsius" />);
    expect(screen.getByText(/pronóstico estará disponible/i)).toBeInTheDocument();
  });

  it("representa iconos de cielo nublado, lluvia, nieve, tormenta y niebla", () => {
    render(
      <>
        {["02d", "09d", "13d", "11d", "50d"].map((icon) => (
          <WeatherIcon key={icon} code={icon} />
        ))}
      </>,
    );
    expect(screen.getAllByRole("img")).toHaveLength(5);
    expect(() => render(<HumidityRing value={140} />)).not.toThrow();
    const { container } = render(<SunArc sunrise={200} sunset={100} now={150} language="es" />);
    expect(container.querySelector(".sun-arc")).toBeInTheDocument();
    expect(() =>
      render(
        <WeatherDetails weather={{ ...weather, visibility: 0 }} language="en" unit="celsius" />,
      ),
    ).not.toThrow();
  });

  it("inclina la tarjeta solo con un puntero de mouse y vuelve a cero al salir", () => {
    const originalMatchMedia = window.matchMedia;
    const scrollIntoView = jest.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    window.matchMedia = jest.fn(() => ({
      matches: true,
      media: "(pointer: fine)",
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    const { container } = render(
      <CurrentWeather weather={weather} language="es" unit="celsius" onToggleUnit={jest.fn()} />,
    );
    const card = container.querySelector(".current")!;
    fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 30, clientY: 40 });
    fireEvent.pointerLeave(card);
    window.matchMedia = originalMatchMedia;
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  });

  it("cubre estados, preferencias, fondo y componentes de presentación", () => {
    const { rerender } = render(
      <>
        <WeatherBackground icon="11d" />
        <EmptyState language="es" />
        <ErrorState language="en" code="CITY_NOT_FOUND" />
        <Skeletons language="es" />
        <PreferenceControls
          language="es"
          theme="system"
          unit="celsius"
          onLanguage={jest.fn()}
          onTheme={jest.fn()}
          onUnit={jest.fn()}
        />
        <AnimatedNumber value={12} />
        <Card className="test">Card body</Card>
      </>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't find that city");
    expect(screen.getByText("Card body")).toBeInTheDocument();
    rerender(
      <>
        <WeatherBackground />
        <EmptyState language="en" />
        <ErrorState language="es" code="UPSTREAM_ERROR" />
        <Skeletons language="en" />
        <PreferenceControls
          language="en"
          theme="dark"
          unit="fahrenheit"
          onLanguage={jest.fn()}
          onTheme={jest.fn()}
          onUnit={jest.fn()}
        />
        <AnimatedNumber value={13} />
      </>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos cargar el clima");
  });

  it("renderiza capas de ambiente para cada condición y respeta movimiento reducido", () => {
    const matchMedia = jest.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
    const getContext = jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { container, rerender, unmount } = render(<WeatherBackground icon="01n" />);
    expect(container.querySelector(".star-layer")).toBeInTheDocument();
    rerender(<WeatherBackground icon="01d" />);
    expect(container.querySelector(".sun-rays")).toBeInTheDocument();
    rerender(<WeatherBackground icon="03d" />);
    expect(container.querySelector(".cloud-layer")).toBeInTheDocument();
    expect(container.querySelector(".fog-layer")).toBeInTheDocument();
    rerender(<WeatherBackground icon="11d" />);
    expect(container.querySelector(".ambient-lightning")).toBeInTheDocument();
    rerender(<WeatherBackground icon="13d" />);
    expect(container.querySelector(".cloud-layer")).not.toBeInTheDocument();
    unmount();
    getContext.mockRestore();
    matchMedia.mockRestore();
  });

  it("alterna las preferencias compactas y los tres temas", () => {
    const onLanguage = jest.fn();
    const onTheme = jest.fn();
    const onUnit = jest.fn();
    const transition = jest.fn((callback: () => void) => callback());
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: transition,
    });
    const { container, rerender } = render(
      <PreferenceControls
        language="es"
        theme="system"
        unit="celsius"
        onLanguage={onLanguage}
        onTheme={onTheme}
        onUnit={onUnit}
      />,
    );
    fireEvent.click(container.querySelector(".unit-compact")!);
    fireEvent.click(container.querySelector(".language-compact")!);
    fireEvent.click(container.querySelector(".theme-compact")!);
    expect(onUnit).toHaveBeenCalledTimes(1);
    expect(onLanguage).toHaveBeenCalledWith("en");
    expect(onTheme).toHaveBeenCalledWith("light");
    rerender(
      <PreferenceControls
        language="en"
        theme="light"
        unit="fahrenheit"
        onLanguage={onLanguage}
        onTheme={onTheme}
        onUnit={onUnit}
      />,
    );
    fireEvent.click(container.querySelector(".theme-compact")!);
    rerender(
      <PreferenceControls
        language="en"
        theme="dark"
        unit="fahrenheit"
        onLanguage={onLanguage}
        onTheme={onTheme}
        onUnit={onUnit}
      />,
    );
    fireEvent.click(container.querySelector(".theme-compact")!);
    expect(onTheme).toHaveBeenNthCalledWith(2, "dark");
    expect(onTheme).toHaveBeenNthCalledWith(3, "system");
    expect(transition).toHaveBeenCalledTimes(3);
    Reflect.deleteProperty(document, "startViewTransition");
  });
});
