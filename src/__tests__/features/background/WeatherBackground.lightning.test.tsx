import { act, render } from "@testing-library/react";
import { WeatherBackground } from "@/features/background/components/WeatherBackground";
import { drawLightning } from "@/features/background/components/lightning";

// Se observa `drawLightning` (y no `stroke`, que también usan las gotas de lluvia) para saber si hay un rayo en pantalla.
jest.mock("@/features/background/components/lightning", () => ({
  ...jest.requireActual("@/features/background/components/lightning"),
  drawLightning: jest.fn(),
}));
const drawn = drawLightning as jest.Mock;

/**
 * Prueba determinista del relámpago que dibuja el fondo animado.
 * El primer relámpago se programa con `performance.now()`; se fija ese reloj en 0 y se avanzan los cuadros a mano
 * para que el resultado no dependa de cuánto tiempo lleve vivo el proceso de pruebas (antes variaba entre ejecuciones).
 */
function fakeContext() {
  const store: Record<string, unknown> = {};
  return new Proxy(store, {
    get: (target, property: string) => {
      if (property in target) return target[property];
      // Cualquier método de canvas (stroke, moveTo...) es un espía; los gradientes devuelven un objeto con addColorStop.
      const method = jest.fn(() => ({ addColorStop: jest.fn() }));
      target[property] = method;
      return method;
    },
    set: (target, property: string, value) => {
      target[property] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

const notReducedMotion = () =>
  ({ matches: false, media: "", onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() }) as unknown as MediaQueryList;

describe("relámpago del fondo animado", () => {
  let frames: FrameRequestCallback[];
  let context: CanvasRenderingContext2D;

  beforeEach(() => {
    drawn.mockClear();
    frames = [];
    context = fakeContext();
    jest.spyOn(performance, "now").mockReturnValue(0);
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as never);
    Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", { configurable: true, value: 800 });
    Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", { configurable: true, value: 400 });
    window.matchMedia = jest.fn(notReducedMotion) as unknown as typeof window.matchMedia;
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  const runFrame = (time: number) => act(() => frames.shift()?.(time));

  it("en tormenta dibuja el rayo, lo mantiene durante 340 ms y luego lo retira", () => {
    const { unmount } = render(<WeatherBackground icon="11d" />);

    runFrame(1000); // aún no toca: el primer rayo de tormenta llega a los 1200 ms
    expect(drawn).not.toHaveBeenCalled();

    runFrame(1300); // se genera el rayo y se dibuja con la intensidad máxima de tormenta (0.72)
    expect(drawn).toHaveBeenCalledTimes(1);
    expect(drawn.mock.calls[0][2]).toBeCloseTo(0.72);

    runFrame(1400); // sigue visible (progreso < 1) y se desvanece
    expect(drawn).toHaveBeenCalledTimes(2);
    expect(drawn.mock.calls[1][2]).toBeLessThan(0.72);

    runFrame(1700); // pasaron más de 340 ms: el rayo se retira y ya no se dibuja
    expect(drawn).toHaveBeenCalledTimes(2);

    unmount();
  });

  it.each([
    ["lluvia", "10d"],
    ["nublado", "03d"],
  ])("en %s el relámpago es lejano: tarda 15 s y dura 180 ms", (_name, icon) => {
    const { unmount } = render(<WeatherBackground icon={icon} />);

    runFrame(5000);
    expect(drawn).not.toHaveBeenCalled();

    runFrame(16000); // supera los 15 s iniciales: aparece un relámpago lejano, mucho más tenue (0.18)
    expect(drawn).toHaveBeenCalledTimes(1);
    expect(drawn.mock.calls[0][2]).toBeCloseTo(0.18);

    runFrame(16500); // más de 180 ms después: el relámpago terminó
    expect(drawn).toHaveBeenCalledTimes(1);

    unmount();
  });
});
