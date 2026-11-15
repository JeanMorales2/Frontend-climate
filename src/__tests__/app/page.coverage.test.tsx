import { fireEvent, render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { usePreferences } from "@/stores/preferences";
import { useWeather, useForecast } from "@/features/weather";
import { useDemo } from "@/features/demo";

const weather = { city: "Lima", country: "PE", temperature: 20, min: 18, max: 23, feelsLike: 20, humidity: 60, description: "lluvia", icon: "10d", windSpeed: 2, windDegrees: 1, pressure: 1, visibility: 1, clouds: 1, sunrise: 1, sunset: 2, updatedAt: 1 };

jest.mock("@/features/weather", () => ({
  CurrentWeather: ({ weather: value, onToggleUnit }: { weather: typeof weather; onToggleUnit: () => void }) => <button onClick={onToggleUnit}>actual:{value.city}</button>,
  WeatherDetails: () => <div>detalles</div>,
  Forecast: ({ days }: { days: unknown[] }) => <div>pronostico:{days.length}</div>,
  useWeather: jest.fn(), useForecast: jest.fn(),
}));
jest.mock("@/features/background", () => ({ WeatherBackground: () => <div /> }));
jest.mock("@/features/search", () => ({
  SearchBar: ({ onSearch, onInteract }: { onSearch: (value: string) => void; onInteract: () => void }) => <><button onClick={() => onSearch("  Lima  ")}>buscar</button><button onClick={() => onSearch("   ")}>vacio</button><button onClick={onInteract}>interactuar</button></>,
  RecentSearches: ({ cities, onSelect, onRemove, onClear }: { cities: string[]; onSelect: (value: string) => void; onRemove: (value: string) => void; onClear: () => void }) => <div>{cities.map((city) => <span key={city}><button onClick={() => onSelect(city)}>reciente:{city}</button><button onClick={() => onRemove(city)}>quitar:{city}</button></span>)}<button onClick={onClear}>limpiar</button></div>,
}));
jest.mock("@/features/preferences", () => ({ PreferenceControls: ({ onLanguage, onTheme, onUnit, onDemo, demoRunning }: { onLanguage: (v: "en") => void; onTheme: (v: "dark") => void; onUnit: () => void; onDemo: () => void; demoRunning: boolean }) => <><button onClick={() => onLanguage("en")}>idioma</button><button onClick={() => onTheme("dark")}>tema</button><button onClick={onUnit}>unidad</button><button onClick={onDemo}>{demoRunning ? "detener" : "demo"}</button></> }));
jest.mock("@/features/demo", () => ({ DemoWelcome: ({ onClose, onStart }: { onClose: () => void; onStart: () => void }) => <><button onClick={onClose}>cerrar bienvenida</button><button onClick={onStart}>iniciar bienvenida</button></>, useDemo: jest.fn() }));

describe("Home: estados e interacciones", () => {
  const start = jest.fn(); const stop = jest.fn();
  beforeEach(() => {
    start.mockClear(); stop.mockClear();
    usePreferences.setState({ unit: "celsius", theme: "system", language: "es", recent: ["Quito"], setUnit: jest.fn(), setTheme: jest.fn(), setLanguage: jest.fn(), addRecent: jest.fn(), removeRecent: jest.fn(), clearRecent: jest.fn() });
    (useDemo as jest.Mock).mockReturnValue({ running: false, step: null, index: 0, total: 2, start, stop });
    (useWeather as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, isError: false });
    (useForecast as jest.Mock).mockReturnValue({ data: [], isLoading: false, isError: false });
  });
  it("muestra vacío, bienvenida, búsqueda normalizada y recientes", () => {
    const { rerender } = render(<Home />);
    expect(screen.getByText(/Tu próxima consulta/i)).toBeInTheDocument();
    expect(screen.queryByText(/OpenWeather|Open-Meteo/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("cerrar bienvenida"));
    expect(screen.getByText(/Escribe una ciudad/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("buscar"));
    expect(stop).toHaveBeenCalled();
    expect(usePreferences.getState().addRecent).toHaveBeenCalledWith("Lima");
    fireEvent.click(screen.getByText("vacio"));
    rerender(<Home />);
    expect(screen.queryByText("reciente:Quito")).not.toBeInTheDocument();
  });
  it("inicia demo desde la bienvenida y opera los recientes", () => {
    render(<Home />); fireEvent.click(screen.getByText("iniciar bienvenida")); expect(start).toHaveBeenCalled();
  });
  it("renderiza carga, error, datos y demo; cambia preferencias", () => {
    const { rerender } = render(<Home />);
    fireEvent.click(screen.getByText("buscar"));
    (useWeather as jest.Mock).mockReturnValue({ data: undefined, isLoading: true, isError: false }); rerender(<Home />);
    expect(document.querySelector(".panel.loading")).toBeInTheDocument();
    (useWeather as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error("CITY_NOT_FOUND") }); rerender(<Home />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    (useWeather as jest.Mock).mockReturnValue({ data: weather, isLoading: false, isError: false });
    (useForecast as jest.Mock).mockReturnValue({ data: [{ date: "x" }], isLoading: false, isError: false }); rerender(<Home />);
    expect(screen.getByText("actual:Lima")).toBeInTheDocument(); expect(screen.getByText("pronostico:1")).toBeInTheDocument(); fireEvent.click(screen.getByText("actual:Lima"));
    fireEvent.click(screen.getByText("unidad")); expect(usePreferences.getState().setUnit).toHaveBeenCalledWith("fahrenheit");
    fireEvent.click(screen.getByText("idioma")); fireEvent.click(screen.getByText("tema"));
    expect(usePreferences.getState().setLanguage).toHaveBeenCalledWith("en"); expect(usePreferences.getState().setTheme).toHaveBeenCalledWith("dark");
    (useDemo as jest.Mock).mockReturnValue({ running: true, step: { weather, forecast: [], label: "lluvia", theme: "dark" }, index: 1, total: 2, start, stop }); rerender(<Home />);
    expect(screen.getByText(/Demo/)).toBeInTheDocument(); fireEvent.click(screen.getAllByText("actual:Lima").at(-1)!); fireEvent.click(screen.getByText("detener")); expect(stop).toHaveBeenCalled();
  });
});
