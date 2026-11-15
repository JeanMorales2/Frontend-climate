import { fireEvent, render, screen } from "@testing-library/react";
import { usePreferences } from "@/stores/preferences";

const useWeather = jest.fn(); const useForecast = jest.fn(); const useDemo = jest.fn();
jest.mock("@/features/weather", () => ({
  useWeather: (...a: unknown[]) => useWeather(...a), useForecast: (...a: unknown[]) => useForecast(...a),
  CurrentWeather: ({ onToggleUnit }: { onToggleUnit: () => void }) => <button onClick={onToggleUnit}>actual</button>, WeatherDetails: () => <div />, Forecast: () => <div />,
}));
jest.mock("@/features/background", () => ({ WeatherBackground: () => <div /> }));
jest.mock("@/features/search", () => ({ SearchBar: ({ onInteract }: { onInteract: () => void }) => <button onClick={onInteract}>interact</button>, RecentSearches: () => <div /> }));
jest.mock("@/features/demo", () => ({ useDemo: (...a: unknown[]) => useDemo(...a), DemoWelcome: () => <div /> }));
jest.mock("@/features/preferences", () => ({ PreferenceControls: ({ onLanguage, onTheme, onUnit, onDemo }: { onLanguage: (x: "en") => void; onTheme: (x: "dark") => void; onUnit: () => void; onDemo: () => void }) => <><button onClick={() => onLanguage("en")}>lang</button><button onClick={() => onTheme("dark")}>theme</button><button onClick={onUnit}>unit</button><button onClick={onDemo}>demo</button></> }));
import Home from "@/app/page";

describe("Home: ramas del demo", () => {
  const stop = jest.fn(); const start = jest.fn();
  beforeEach(() => {
    stop.mockClear(); start.mockClear();
    usePreferences.setState({ unit: "fahrenheit", theme: "light", language: "es", recent: [], setUnit: jest.fn(), setTheme: jest.fn(), setLanguage: jest.fn(), addRecent: jest.fn(), removeRecent: jest.fn(), clearRecent: jest.fn() });
    useWeather.mockReturnValue({ data: undefined, isLoading: false, isError: false }); useForecast.mockReturnValue({ data: undefined });
    useDemo.mockReturnValue({ running: true, step: { weather: {}, forecast: [], label: "x", theme: "dark" }, index: undefined, total: 2, stop, start });
  });
  it("detiene demo al cambiar preferencias, interactuar y pulsar demo", () => {
    render(<Home />); fireEvent.click(screen.getByText("lang")); fireEvent.click(screen.getByText("theme")); fireEvent.click(screen.getByText("unit")); fireEvent.click(screen.getByText("interact")); fireEvent.click(screen.getByText("demo"));
    expect(stop).toHaveBeenCalledTimes(4); expect(usePreferences.getState().setUnit).toHaveBeenCalledWith("celsius");
  });
  it("inicia demo inactivo y usa Celsius dentro del paso", () => {
    usePreferences.setState({ ...usePreferences.getState(), unit: "celsius" });
    useDemo.mockReturnValue({ running: false, step: null, index: 0, total: 2, stop, start });
    const { rerender } = render(<Home />); fireEvent.click(screen.getByText("demo")); expect(start).toHaveBeenCalled();
    useDemo.mockReturnValue({ running: true, step: { weather: {}, forecast: [], label: "x", theme: "dark" }, index: 0, total: 2, stop, start }); rerender(<Home />); fireEvent.click(screen.getByText("actual"));
  });
});
