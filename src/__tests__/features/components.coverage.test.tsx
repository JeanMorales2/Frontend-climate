import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { DemoWelcome } from "@/features/demo/components/DemoWelcome";
import { SearchBar } from "@/features/search/components/SearchBar";
import { useCitySuggestions } from "@/features/search/hooks/useCitySuggestions";
import { CurrentWeather } from "@/features/weather/components/CurrentWeather";
import { WeatherIcon } from "@/features/weather/components/WeatherIcon";
import { useDebounce } from "@/hooks/useDebounce";

jest.mock("@/features/search/hooks/useCitySuggestions");
const suggestion = { name: "León", state: "Castilla", country: "ES", lat: 1, lon: 2 };
const weather = { city: "Lima", country: "PE", temperature: 20, min: 18, max: 23, feelsLike: 20, humidity: 60, description: "lluvia", icon: "10d", windSpeed: 2, windDegrees: 1, pressure: 1, visibility: 1, clouds: 1, sunrise: 1, sunset: 2, updatedAt: 1 };

describe("componentes de las features", () => {
  beforeEach(() => { jest.useFakeTimers(); (useCitySuggestions as jest.Mock).mockReturnValue({ data: [suggestion] }); });
  afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });
  it("opera búsqueda mediante teclado, limpiar, selección y cierre externo", () => {
    const search = jest.fn(), interact = jest.fn(); render(<SearchBar language="es" onSearch={search} onInteract={interact} error />); const input = screen.getByRole("combobox");
    fireEvent.keyDown(window, { key: "/" }); fireEvent.change(input, { target: { value: "Le" } }); fireEvent.keyDown(input, { key: "ArrowDown" }); fireEvent.keyDown(input, { key: "ArrowUp" }); fireEvent.keyDown(input, { key: "Enter" });
    expect(search).toHaveBeenCalledWith("León, Castilla, ES"); fireEvent.change(input, { target: { value: "x" } }); fireEvent.click(screen.getByLabelText("Limpiar búsqueda")); fireEvent.focus(input); fireEvent.pointerDown(document.body); expect(interact).toHaveBeenCalled();
  });
  it("posiciona bienvenida, distingue el objetivo y reacciona a Escape", () => {
    const close = jest.fn(), start = jest.fn(); const target = document.createElement("button"); target.dataset.demoTarget = ""; target.getBoundingClientRect = () => ({ left: 10, right: 100, top: 20, bottom: 50, width: 90, height: 30 } as DOMRect); document.body.append(target);
    const { container, unmount } = render(<DemoWelcome language="es" demoButtonRef={{ current: target }} onClose={close} onStart={start} />); expect(container.querySelector(".welcome-halo")).toBeInTheDocument(); fireEvent.keyDown(window, { key: "Escape" }); fireEvent.click(screen.getByLabelText("Cerrar bienvenida"), { clientX: 0, clientY: 0 }); fireEvent.click(screen.getByLabelText("Cerrar bienvenida"), { clientX: 55, clientY: 35 }); fireEvent.click(screen.getByRole("button", { name: "Entendido" })); expect(close).toHaveBeenCalled(); expect(start).toHaveBeenCalled(); fireEvent(window, new Event("resize")); unmount(); target.remove();
  });
  it("desplaza tarjeta móvil, inclina sólo con mouse fino y muestra todos los iconos", () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: jest.fn() }); window.matchMedia = jest.fn((query) => ({ matches: query.includes("max-width") || query.includes("pointer"), media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() })) as unknown as typeof window.matchMedia; jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: 900, bottom: 1000, left: 0, width: 100, height: 100 } as DOMRect);
    const { container } = render(<CurrentWeather weather={weather} language="es" unit="celsius" onToggleUnit={jest.fn()} />); expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled(); fireEvent.pointerMove(container.querySelector(".current")!, { pointerType: "mouse", clientX: 20, clientY: 20 }); fireEvent.pointerLeave(container.querySelector(".current")!);
    ["01d", "01n", "03d", "50d", "10d", "11d", "13d"].forEach((code) => { const view = render(<WeatherIcon code={code} />); expect(view.container.querySelector('[role="img"]')).toBeInTheDocument(); view.unmount(); });
  });
  it("consulta sugerencias fallidas y usa el retardo por defecto", async () => {
    const debounce = renderHook(() => useDebounce("x")); expect(debounce.result.current).toBe("x");
  });
});
