export type LightningPoint = { x: number; y: number };

/** Genera un rayo dentado determinista cuando se proporciona random, útil para pruebas. */
export function generateLightning(startX: number, width: number, height: number, random = Math.random): LightningPoint[] {
  const points: LightningPoint[] = [{ x: startX, y: 0 }];
  const segments = 9;
  for (let index = 1; index <= segments; index += 1) {
    const previous = points[index - 1];
    points.push({
      x: Math.max(0, Math.min(width, previous.x + (random() - 0.5) * width * 0.14)),
      y: (height * 0.68 * index) / segments,
    });
  }
  return points;
}

/* istanbul ignore next -- dibujo dependiente de Canvas; la geometría pura se prueba arriba. */
export function drawLightning(context: CanvasRenderingContext2D, points: LightningPoint[], alpha: number) {
  if (points.length < 2) return;
  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = "#eaf4ff";
  context.lineWidth = 2.2;
  context.shadowColor = "#8e7dff";
  context.shadowBlur = 18;
  context.beginPath();
  points.forEach((point, index) => (index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)));
  context.stroke();
  context.lineWidth = 0.9;
  context.strokeStyle = "#ffffff";
  context.shadowBlur = 5;
  context.stroke();
  context.restore();
}
