import { drawParticles, type Particle, type ParticlePalette } from "./particles";

function canvasContext() {
  return {
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    globalAlpha: 1,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

const lightRain: ParticlePalette = {
  rain: "#1f5f8f",
  snow: "#4b7899",
  sparkle: "#bd6d12",
  rainAlphaMin: 0.55,
  rainAlphaPulse: 0.15,
  rainWidth: 1.5,
  rainWidthVariation: 0.45,
  rainLength: 7,
  rainDensity: 1.45,
  rainStormDensity: 1.8,
  rainStormSpeed: 3.5,
  rainStormWind: 1.2,
};

describe("drawParticles", () => {
  it("dibuja la lluvia clara con más grosor, longitud y opacidad", () => {
    const context = canvasContext();
    const particle: Particle = { x: 20, y: 10, speed: 1, size: 2, phase: 0 };

    drawParticles(context, [particle], 100, 100, "rain", 0, lightRain);

    expect(context.strokeStyle).toBe("#1f5f8f");
    expect(context.lineWidth).toBeCloseTo(1.95);
    expect(context.lineTo).toHaveBeenCalledWith(16.2, 27);
    expect(context.stroke).toHaveBeenCalledTimes(1);
  });

  it("acelera e inclina la lluvia de tormenta", () => {
    const context = canvasContext();
    const particle: Particle = { x: 20, y: 10, speed: 1, size: 1, phase: 0 };

    drawParticles(context, [particle], 100, 100, "storm", 0, lightRain);

    expect(particle).toMatchObject({ x: 18.8, y: 13.5 });
    expect(context.lineTo).toHaveBeenCalledWith(15.8, 20.5);
  });

  it("mantiene la geometría previa cuando no recibe ajustes de tema", () => {
    const context = canvasContext();
    const particle: Particle = { x: 20, y: 10, speed: 1, size: 2, phase: 0 };

    drawParticles(context, [particle], 100, 100, "storm", 0);

    expect(particle).toMatchObject({ x: 19.2, y: 13 });
    expect(context.lineWidth).toBe(1);
    expect(context.lineTo).toHaveBeenCalledWith(16.2, 23);
  });
});
