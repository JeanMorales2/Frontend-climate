export type Particle = { x: number; y: number; speed: number; size: number; phase: number };

export type ParticlePalette = {
  rain: string;
  snow: string;
  sparkle: string;
  rainAlphaMin: number;
  rainAlphaPulse: number;
  rainWidth: number;
  rainWidthVariation: number;
  rainLength: number;
  rainDensity: number;
  rainStormDensity: number;
  rainStormSpeed: number;
  rainStormWind: number;
};

// Valores del tema oscuro; se usan si las variables CSS todavía no están disponibles.
export const defaultPalette: ParticlePalette = {
  rain: "#d5e8f2",
  snow: "#ffffff",
  sparkle: "#fff1c5",
  // Conservan la apariencia previa cuando el tema no declara ajustes de lluvia.
  rainAlphaMin: 0.22,
  rainAlphaPulse: 0.2,
  rainWidth: 1,
  rainWidthVariation: 0,
  rainLength: 5,
  rainDensity: 1,
  rainStormDensity: 1,
  rainStormSpeed: 3,
  rainStormWind: 0.8,
};

// Los colores salen de las variables --fx-* para que las partículas se vean en los dos temas.
export function readPalette(element: Element): ParticlePalette {
  const styles = getComputedStyle(element);
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  const readNumber = (name: string, fallback: number) => {
    const value = Number.parseFloat(read(name, String(fallback)));
    return Number.isFinite(value) ? value : fallback;
  };
  return {
    rain: read("--fx-rain", defaultPalette.rain),
    snow: read("--fx-snow", defaultPalette.snow),
    sparkle: read("--fx-sparkle", defaultPalette.sparkle),
    rainAlphaMin: readNumber("--fx-rain-alpha-min", defaultPalette.rainAlphaMin),
    rainAlphaPulse: readNumber("--fx-rain-alpha-pulse", defaultPalette.rainAlphaPulse),
    rainWidth: readNumber("--fx-rain-width", defaultPalette.rainWidth),
    rainWidthVariation: readNumber("--fx-rain-width-variation", defaultPalette.rainWidthVariation),
    rainLength: readNumber("--fx-rain-length", defaultPalette.rainLength),
    rainDensity: readNumber("--fx-rain-density", defaultPalette.rainDensity),
    rainStormDensity: readNumber("--fx-rain-storm-density", defaultPalette.rainStormDensity),
    rainStormSpeed: readNumber("--fx-rain-storm-speed", defaultPalette.rainStormSpeed),
    rainStormWind: readNumber("--fx-rain-storm-wind", defaultPalette.rainStormWind),
  };
}

export function createParticles(width: number, height: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: 0.5 + Math.random() * 2.5,
    size: 1 + Math.random() * 2,
    phase: Math.random() * Math.PI * 2,
  }));
}

export function drawParticles(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
  condition: string,
  time: number,
  palette: ParticlePalette = defaultPalette,
) {
  context.clearRect(0, 0, width, height);
  for (const particle of particles) {
    const snow = condition === "snow";
    const rain = condition === "rain" || condition === "storm";
    // Los destellos representan la luz solar, no polvo ambiental. No deben
    // dibujarse para nubes, lluvia, niebla ni durante la noche.
    const sparkle = condition === "clear";
    if (!rain && !snow && !sparkle) continue;
    const storm = condition === "storm";
    particle.y += particle.speed * (rain ? (storm ? palette.rainStormSpeed : 3) : 1);
    particle.x += snow ? Math.sin(time / 800 + particle.phase) * 0.6 : rain ? -(storm ? palette.rainStormWind : 0.8) : 0;
    if (particle.y > height) {
      particle.y = -5;
      particle.x = Math.random() * width;
    }
    if (particle.x < -5) particle.x = width + 5;
    context.globalAlpha = rain
      ? Math.min(0.9, palette.rainAlphaMin + (Math.sin(time / 550 + particle.phase) + 1) * palette.rainAlphaPulse)
      : 0.22 + (Math.sin(time / 550 + particle.phase) + 1) * 0.2;
    context.fillStyle = rain ? palette.rain : snow ? palette.snow : palette.sparkle;
    context.beginPath();
    if (rain) {
      context.moveTo(particle.x, particle.y);
      context.lineWidth = palette.rainWidth + (particle.size - 1) * palette.rainWidthVariation;
      context.lineTo(particle.x - 3, particle.y + particle.size * palette.rainLength);
      context.strokeStyle = context.fillStyle;
      context.stroke();
    } else {
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;
}
