export type Particle = { x: number; y: number; speed: number; size: number; phase: number };

export type ParticlePalette = { rain: string; snow: string; sparkle: string };

// Valores del tema oscuro; se usan si las variables CSS todavía no están disponibles.
export const defaultPalette: ParticlePalette = {
  rain: "#d5e8f2",
  snow: "#ffffff",
  sparkle: "#fff1c5",
};

// Los colores salen de las variables --fx-* para que las partículas se vean en los dos temas.
export function readPalette(element: Element): ParticlePalette {
  const styles = getComputedStyle(element);
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  return {
    rain: read("--fx-rain", defaultPalette.rain),
    snow: read("--fx-snow", defaultPalette.snow),
    sparkle: read("--fx-sparkle", defaultPalette.sparkle),
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
    particle.y += particle.speed * (rain ? 3 : 1);
    particle.x += snow ? Math.sin(time / 800 + particle.phase) * 0.6 : rain ? -0.8 : 0;
    if (particle.y > height) {
      particle.y = -5;
      particle.x = Math.random() * width;
    }
    if (particle.x < -5) particle.x = width + 5;
    context.globalAlpha = 0.22 + (Math.sin(time / 550 + particle.phase) + 1) * 0.2;
    context.fillStyle = rain ? palette.rain : snow ? palette.snow : palette.sparkle;
    context.beginPath();
    if (rain) {
      context.moveTo(particle.x, particle.y);
      context.lineTo(particle.x - 3, particle.y + particle.size * 5);
      context.strokeStyle = context.fillStyle;
      context.stroke();
    } else {
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;
}
