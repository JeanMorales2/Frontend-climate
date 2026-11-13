import { usePreferences } from "./preferences";

describe("preferencias", () => {
  beforeEach(() => {
    usePreferences.setState({ unit: "celsius", theme: "system", language: "es", recent: [] });
  });

  it("actualiza opciones y normaliza recientes conservando seis", () => {
    usePreferences.getState().setUnit("fahrenheit");
    usePreferences.getState().setTheme("dark");
    usePreferences.getState().setLanguage("en");
    ["Lima", "Madrid", "Quito", "Bogotá", "Oslo", "Roma", "Tokyo"].forEach((city) =>
      usePreferences.getState().addRecent(city),
    );
    usePreferences.getState().addRecent("lima");
    expect(usePreferences.getState()).toMatchObject({
      unit: "fahrenheit",
      theme: "dark",
      language: "en",
      recent: ["lima", "Tokyo", "Roma", "Oslo", "Bogotá", "Quito"],
    });
    usePreferences.getState().removeRecent("Roma");
    usePreferences.getState().clearRecent();
    expect(usePreferences.getState().recent).toEqual([]);
  });
});
