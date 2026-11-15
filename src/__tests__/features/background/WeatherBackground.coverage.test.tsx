import { act, fireEvent, render } from "@testing-library/react";
import { WeatherBackground } from "@/features/background/components/WeatherBackground";
import { createParticles, drawParticles, readPalette } from "@/features/background/components/particles";
import { drawLightning } from "@/features/background/components/lightning";

const ctx = { clearRect: jest.fn(), setTransform: jest.fn(), beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), stroke: jest.fn(), arc: jest.fn(), fill: jest.fn(), save: jest.fn(), restore: jest.fn(), globalAlpha: 1, fillStyle: "", strokeStyle: "", lineWidth: 1, shadowColor: "", shadowBlur: 0 } as unknown as CanvasRenderingContext2D;
const media = (matches = false) => ({ matches, media: "", onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() });
describe("WeatherBackground y partículas", () => {
  beforeEach(() => { jest.useFakeTimers(); jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx); Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", { configurable: true, value: 320 }); Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", { configurable: true, value: 160 }); window.matchMedia = jest.fn(() => media()) as unknown as typeof window.matchMedia; window.requestAnimationFrame = jest.fn(() => 1); window.cancelAnimationFrame = jest.fn(); });
  afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });
  it("dibuja y recicla partículas de lluvia, nieve y brillo", () => {
    jest.spyOn(Math, "random").mockReturnValue(.5); const particle = { x: -6, y: 200, speed: 1, size: 2, phase: 0 };
    drawParticles(ctx, [particle], 100, 100, "snow", 0); drawParticles(ctx, [{ x: 2, y: 2, speed: 1, size: 1, phase: 0 }], 100, 100, "clear", 0); drawParticles(ctx, [], 100, 100, "mist", 0);
    expect(particle).toMatchObject({ x: 50, y: -5 }); expect(createParticles(2, 2, 3)).toHaveLength(3); expect(readPalette(document.documentElement).rain).toBeTruthy(); drawLightning(ctx, [], .2); drawLightning(ctx, [{ x: 0, y: 0 }, { x: 2, y: 4 }], .2); expect(ctx.stroke).toHaveBeenCalled();
  });
  it("cubre capas, flash, visibilidad y limpieza", () => {
    jest.spyOn(Math, "random").mockReturnValue(0); const { container, rerender, unmount } = render(<WeatherBackground icon="11d" />); expect(container.querySelector(".ambient-lightning")).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(2000)); expect(container.firstElementChild).toHaveClass("is-flashing"); fireEvent(window, new Event("resize")); fireEvent(window, new Event("orientationchange")); Object.defineProperty(document, "hidden", { configurable: true, value: true }); fireEvent(document, new Event("visibilitychange")); Object.defineProperty(document, "hidden", { configurable: true, value: false }); fireEvent(document, new Event("visibilitychange"));
    rerender(<WeatherBackground icon="01n" />); expect(container.querySelector(".star-layer")).toBeInTheDocument(); rerender(<WeatherBackground icon="01d" />); expect(container.querySelector(".sun-rays")).toBeInTheDocument(); rerender(<WeatherBackground icon="50d" />); expect(container.querySelector(".fog-layer")).toBeInTheDocument(); fireEvent.pointerMove(container.firstElementChild!, { pointerType: "mouse", clientX: 1, clientY: 1 }); fireEvent.pointerLeave(container.firstElementChild!); unmount(); expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
  it("respeta movimiento reducido y tolera un contexto ausente", () => {
    window.matchMedia = jest.fn(() => media(true)) as unknown as typeof window.matchMedia; const reduced = render(<WeatherBackground icon="09d" />); expect(reduced.container.querySelector(".cloud-layer")).toBeInTheDocument(); reduced.unmount(); jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null); const noContext = render(<WeatherBackground icon={undefined} />); expect(document.documentElement.dataset.weather).toBeUndefined(); noContext.unmount();
  });
});
