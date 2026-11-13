import { getCondition } from "./conditions";
import { translate } from "./i18n";

describe("condiciones e idioma", () => {
  it.each([
    ["01d", "clear"],
    ["03n", "clouds"],
    ["10d", "rain"],
    ["11d", "storm"],
    ["13n", "snow"],
    ["50d", "mist"],
  ])("clasifica %s", (icon, expected) => expect(getCondition(icon)).toBe(expected));

  it("traduce textos para ambos idiomas", () => {
    expect(translate("es", "search")).toBe("Buscar");
    expect(translate("en", "search")).toBe("Search");
  });
});
