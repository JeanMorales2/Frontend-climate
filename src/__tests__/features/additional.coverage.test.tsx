import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DemoWelcome } from "@/features/demo/components/DemoWelcome";
import { CurrentWeather } from "@/features/weather/components/CurrentWeather";
import { SearchBar } from "@/features/search/components/SearchBar";
import { useCitySuggestions } from "@/features/search/hooks/useCitySuggestions";
import { createParticles, defaultPalette, drawParticles, readPalette } from "@/features/background/components/particles";
import { generateLightning } from "@/features/background/components/lightning";
import { searchOpenMeteoCities } from "@/features/weather/api/openmeteo";
import { WeatherBackground } from "@/features/background/components/WeatherBackground";
import { useWeather } from "@/features/weather/hooks/useWeather";
import { useForecast } from "@/features/weather/hooks/useForecast";
import { useDemo } from "@/features/demo/hooks/useDemo";
import { PreferenceControls } from "@/features/preferences/components/PreferenceControls";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";

jest.mock("@/features/search/hooks/useCitySuggestions", () => ({ useCitySuggestions: jest.fn() }));
const context = { clearRect: jest.fn(), beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), stroke: jest.fn(), arc: jest.fn(), fill: jest.fn(), globalAlpha: 1, fillStyle: "", strokeStyle: "", lineWidth: 1 } as unknown as CanvasRenderingContext2D;
const media = (matches: boolean) => ({ matches, media: "", onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() });
const weather = { city: "Lima", country: "PE", temperature: 20, min: 18, max: 22, feelsLike: 20, humidity: 1, description: "claro", icon: "01d", windSpeed: 1, windDegrees: 1, pressure: 1, visibility: 1, clouds: 1, sunrise: 1, sunset: 2, updatedAt: 1 };

describe("ramas de componentes y utilidades", () => {
  beforeEach(() => { (useCitySuggestions as jest.Mock).mockReturnValue({ data: [] }); });
  it("dibuja todas las variantes de partículas, paleta y relámpagos limitados", () => {
    jest.spyOn(Math, "random").mockReturnValue(.25);
    for (const condition of ["rain", "storm", "snow", "clear", "mist", "clouds", "clear-night"]) {
      drawParticles(context, [{ x: -6, y: 101, speed: 2, size: 2, phase: 0 }], 100, 100, condition, 100, { ...defaultPalette, rainWidthVariation: .4 });
    }
    drawParticles(context, [{ x: -6, y: 0, speed: 1, size: 1, phase: 0 }], 100, 100, "rain", 0);
    expect(createParticles(2, 2, 2)).toHaveLength(2);
    expect(generateLightning(5, 10, 20, () => 0)).toHaveLength(10);
    expect(generateLightning(5, 10, 20, () => 1).every((p) => p.x <= 10)).toBe(true);
    const style = jest.spyOn(window, "getComputedStyle").mockReturnValue({ getPropertyValue: () => "not-a-number" } as unknown as CSSStyleDeclaration);
    expect(readPalette(document.body).rainDensity).toBe(defaultPalette.rainDensity);
    style.mockRestore(); jest.restoreAllMocks();
  });
  it("muestra y usa el foco del recorrido de bienvenida, incluyendo Escape", () => {
    const close = jest.fn(); const start = jest.fn(); const ref = { current: null };
    Object.defineProperty(HTMLButtonElement.prototype, "getBoundingClientRect", { configurable: true, value: () => ({ left: 10, top: 700, right: 110, bottom: 720, width: 100, height: 20 }) });
    const { unmount } = render(<><button data-demo-target>destino</button><DemoWelcome language="es" demoButtonRef={ref} onClose={close} onStart={start} /></>);
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(screen.getByLabelText("Cerrar bienvenida"), { clientX: 60, clientY: 710 });
    expect(close).toHaveBeenCalled(); expect(start).toHaveBeenCalled();
    fireEvent.resize(window); fireEvent(window, new Event("orientationchange")); unmount();
  });
  it("cubre desplazamiento móvil y punteros no finos de CurrentWeather", () => {
    const scroll = jest.fn(); Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scroll });
    window.matchMedia = jest.fn((q) => media(q.includes("max-width") || q.includes("reduced"))) as unknown as typeof window.matchMedia;
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: -10, bottom: -1 } as DOMRect);
    const { container } = render(<CurrentWeather weather={weather} language="en" unit="fahrenheit" onToggleUnit={jest.fn()} />);
    expect(scroll).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    fireEvent.pointerMove(container.querySelector(".current")!, { pointerType: "touch" });
  });
  it("cubre tarjeta visible, ausente y movimiento fino", () => {
    window.matchMedia = jest.fn((q) => media(q.includes("max-width") || q.includes("pointer"))) as unknown as typeof window.matchMedia;
    const { container, unmount } = render(<CurrentWeather weather={weather} language="es" unit="celsius" onToggleUnit={jest.fn()} />);
    const card = container.querySelector(".current")!;
    const event = new Event("pointermove", { bubbles: true }); Object.defineProperty(event, "pointerType", { value: "mouse" }); Object.defineProperty(event, "clientX", { value: 4 }); Object.defineProperty(event, "clientY", { value: 5 });
    fireEvent(card, event); unmount();
    const query = jest.spyOn(document, "querySelector").mockReturnValue(null);
    render(<CurrentWeather weather={weather} language="es" unit="celsius" onToggleUnit={jest.fn()} />); query.mockRestore();
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: 1, bottom: 2 } as DOMRect);
    render(<CurrentWeather weather={weather} language="es" unit="celsius" onToggleUnit={jest.fn()} />);
  });
  it("cubre submit vacío, blur y sugerencia sin estado", () => {
    jest.useFakeTimers(); const search = jest.fn(); const interact = jest.fn();
    (useCitySuggestions as jest.Mock).mockReturnValue({ data: [{ name: "Lima", country: "PE", lat: 1, lon: 2 }] });
    render(<SearchBar language="en" onSearch={search} onInteract={interact} loading error />);
    const input = screen.getByRole("combobox"); fireEvent.submit(input.closest("form")!);
    fireEvent.change(input, { target: { value: "Li" } }); fireEvent.blur(input); act(() => jest.advanceTimersByTime(120));
    fireEvent.focus(input); fireEvent.click(screen.getByRole("option"));
    expect(search).toHaveBeenCalledWith("Lima, PE"); jest.useRealTimers();
  });
  it("normaliza resultados geográficos incompletos", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [{ name: "X", latitude: 1, longitude: 2 }] }) });
    await expect(searchOpenMeteoCities("X")).resolves.toEqual([{ name: "X", country: "", state: undefined, lat: 1, lon: 2 }]);
  });
  it("avanza los cuadros del fondo para cada clima y sus rutas de visibilidad", () => {
    const callbacks: FrameRequestCallback[] = [];
    const canvas = { ...context, setTransform: jest.fn(), save: jest.fn(), restore: jest.fn(), shadowColor: "", shadowBlur: 0 } as unknown as CanvasRenderingContext2D;
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(canvas);
    Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", { configurable: true, value: 800 });
    Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", { configurable: true, value: 300 });
    window.requestAnimationFrame = jest.fn((callback) => { callbacks.push(callback); return callbacks.length; });
    global.requestAnimationFrame = window.requestAnimationFrame;
    window.cancelAnimationFrame = jest.fn(); global.cancelAnimationFrame = window.cancelAnimationFrame;
    window.matchMedia = jest.fn(() => media(false)) as unknown as typeof window.matchMedia;
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 3 });
    const { rerender, unmount } = render(<WeatherBackground icon="11d" />);
    act(() => callbacks.shift()?.(1300));
    act(() => callbacks.shift()?.(1700));
    Object.defineProperty(document, "hidden", { configurable: true, value: true }); fireEvent(document, new Event("visibilitychange"));
    Object.defineProperty(document, "hidden", { configurable: true, value: false }); fireEvent(document, new Event("visibilitychange"));
    for (const icon of ["10d", "03d", "13d", "50d", "01d", "01n"]) {
      rerender(<WeatherBackground icon={icon} />); act(() => callbacks.shift()?.(900));
    }
    unmount(); expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
  it("sale limpiamente si canvas arroja al obtener el contexto", () => {
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => { throw new Error("canvas"); });
    expect(() => render(<WeatherBackground icon="02d" />)).not.toThrow();
  });
  it("cubre fondo reducido, DPR cero y cuadros sin recargar paleta", () => {
    const callbacks: FrameRequestCallback[] = []; window.matchMedia = jest.fn(() => media(false)) as unknown as typeof window.matchMedia;
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ ...context, setTransform: jest.fn(), save: jest.fn(), restore: jest.fn() } as unknown as CanvasRenderingContext2D);
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 0 });
    window.requestAnimationFrame = jest.fn((cb) => { callbacks.push(cb); return 1; }); global.requestAnimationFrame = window.requestAnimationFrame;
    const { rerender } = render(<WeatherBackground icon="10d" />); act(() => callbacks.shift()?.(1)); act(() => callbacks.shift()?.(2));
    rerender(<WeatherBackground icon="11d" />); act(() => callbacks.shift()?.(1300)); act(() => callbacks.shift()?.(1700));
    window.matchMedia = jest.fn(() => media(true)) as unknown as typeof window.matchMedia; rerender(<WeatherBackground icon="10d" />);
  });
  it("omite consultas cuando enabled es falso", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    expect(renderHook(() => useWeather("Lima", "es", false), { wrapper }).result.current.fetchStatus).toBe("idle");
    expect(renderHook(() => useForecast("Lima", "es", false), { wrapper }).result.current.fetchStatus).toBe("idle");
  });
  it("expone UPSTREAM_ERROR si los endpoints no incluyen code", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) }); const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const w = renderHook(() => useWeather("Lima"), { wrapper }); const f = renderHook(() => useForecast("Lima"), { wrapper });
    await waitFor(() => expect(w.result.current.error?.message).toBe("UPSTREAM_ERROR")); await waitFor(() => expect(f.result.current.error?.message).toBe("UPSTREAM_ERROR"));
  });
  it("alterna idioma inglés, selecciona sugerencia con estado y termina el demo", () => {
    const lang = jest.fn(); const { container } = render(<PreferenceControls language="en" theme="light" unit="celsius" onLanguage={lang} onTheme={jest.fn()} onUnit={jest.fn()} />);
    fireEvent.click(container.querySelector(".language-compact")!); expect(lang).toHaveBeenCalledWith("es");
    (useCitySuggestions as jest.Mock).mockReturnValue({ data: [{ name: "Madrid", state: "NM", country: "US", lat: 1, lon: 2 }] }); const search = jest.fn();
    const { getByRole } = render(<SearchBar language="es" onSearch={search} />); fireEvent.focus(getByRole("combobox")); fireEvent.click(getByRole("option")); expect(search).toHaveBeenCalledWith("Madrid, NM, US");
    jest.useFakeTimers(); const demo = renderHook(() => useDemo("es")); act(() => demo.result.current.start()); for (let i = 0; i < 14; i += 1) act(() => jest.advanceTimersByTime(3000)); expect(demo.result.current.running).toBe(false); jest.useRealTimers();
  });
  it("forma selección sin estado y retrocede desde un índice positivo", () => {
    (useCitySuggestions as jest.Mock).mockReturnValue({ data: [{ name: "A", country: "X", lat: 1, lon: 1 }, { name: "B", country: "Y", lat: 2, lon: 2 }] }); const search = jest.fn();
    const { getByRole } = render(<SearchBar language="es" onSearch={search} />); const input = getByRole("combobox"); fireEvent.focus(input); fireEvent.keyDown(input, { key: "ArrowDown" }); fireEvent.keyDown(input, { key: "Enter" }); expect(search).toHaveBeenCalledWith("A, X");
    fireEvent.focus(input); fireEvent.keyDown(input, { key: "ArrowDown" }); fireEvent.keyDown(input, { key: "ArrowDown" }); fireEvent.keyDown(input, { key: "ArrowUp" });
  });
  it("calcula bienvenida sin objetivo, sin ResizeObserver y con movimiento reducido", () => {
    const saved = global.ResizeObserver; const resize = global.ResizeObserver; Reflect.deleteProperty(global, "ResizeObserver");
    window.matchMedia = jest.fn(() => media(true)) as unknown as typeof window.matchMedia;
    const ref = { current: null }; const { unmount } = render(<DemoWelcome language="en" demoButtonRef={ref} onClose={jest.fn()} onStart={jest.fn()} />);
    unmount(); global.ResizeObserver = saved; window.ResizeObserver = resize;
  });
});
