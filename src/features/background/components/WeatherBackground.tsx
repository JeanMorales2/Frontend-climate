"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { getCondition } from "@/features/weather";
import { createParticles, drawParticles, readPalette } from "./particles";
import { drawLightning, generateLightning, type LightningPoint } from "./lightning";

export function WeatherBackground({ icon }: { icon?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 35, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 35, damping: 20 });
  const condition = getCondition(icon ?? "01d");
  const night = icon?.endsWith("n") ?? false;
  const [flash, setFlash] = useState(false);

  // El clima actual se expone en <html> para que el CSS tiña toda la página
  // (fondo, tarjetas y bordes), no solo esta capa.
  useEffect(() => {
    const root = document.documentElement;
    if (!icon) {
      delete root.dataset.weather;
      return;
    }
    root.dataset.weather = condition === "clear" && night ? "clear-night" : condition;
    return () => {
      delete root.dataset.weather;
    };
  }, [icon, condition, night]);

  useEffect(() => {
    if (condition !== "storm" && condition !== "rain" && condition !== "clouds") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timeout = 0;
    let active = true;
    const schedule = () => {
      timeout = window.setTimeout(
        () => {
          if (!active) return;
          setFlash(true);
          window.setTimeout(() => setFlash(false), condition === "storm" ? 280 : 130);
          schedule();
        },
        condition === "storm" ? 2000 + Math.random() * 4000 : 14000 + Math.random() * 12000,
      );
    };
    schedule();
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [condition, night]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let context: CanvasRenderingContext2D | null = null;
    try {
      context = canvas.getContext("2d");
    } catch {
      return;
    }
    if (!context || reduced) return;
    let width = 0;
    let height = 0;
    let frame = 0;
    let nextLightning = performance.now() + (condition === "storm" ? 1200 : 15000);
    let lightning: { points: LightningPoint[]; started: number; duration: number } | null = null;
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * scale;
      canvas.height = height * scale;
      context?.setTransform(scale, 0, 0, scale, 0, 0);
      particles = createParticles(
        width,
        height,
        Math.max(
          28,
          Math.floor(width / (width < 600 ? 16 : 11)) *
            (condition === "storm" ? palette.rainStormDensity : condition === "rain" ? palette.rainDensity : 1),
        ),
      );
    };
    let particles = createParticles(width, height, 20);
    let palette = readPalette(canvas);
    let paletteReadAt = 0;
    const animate = (time: number) => {
      if (document.hidden) return;
      // Releer los colores cada medio segundo basta para seguir un cambio de tema
      // sin consultar estilos en cada cuadro.
      if (time - paletteReadAt > 500) {
        palette = readPalette(canvas);
        paletteReadAt = time;
      }
      // Solo el despejado diurno llega como "clear" a las partículas; para la
      // noche no se reutilizan los destellos cálidos del paso anterior.
      const particleCondition = condition === "clear" && night ? "clear-night" : condition;
      drawParticles(context!, particles, width, height, particleCondition, time, palette);
      if ((condition === "storm" || condition === "rain" || condition === "clouds") && time >= nextLightning) {
        lightning = { points: generateLightning(Math.random() * width, width, height), started: time, duration: condition === "storm" ? 340 : 180 };
        nextLightning = time + (condition === "storm" ? 2000 + Math.random() * 4000 : 14000 + Math.random() * 12000);
      }
      if (lightning) {
        const progress = (time - lightning.started) / lightning.duration;
        if (progress >= 1) lightning = null;
        else drawLightning(context!, lightning.points, (condition === "storm" ? 0.72 : 0.18) * (1 - progress));
      }
      frame = requestAnimationFrame(animate);
    };
    const visibility = () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else frame = requestAnimationFrame(animate);
    };
    resize();
    frame = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [condition, night]);

  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) / 35);
    y.set((event.clientY - rect.top - rect.height / 2) / 35);
  }

  return (
    <motion.div
      key={condition + night}
      className={`weather-background condition-${condition}${night ? " night" : ""}${flash ? " is-flashing" : ""}`}
      aria-hidden="true"
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x, y }}
    >
      <canvas ref={canvasRef} className="weather-particles" />
      {condition === "clear" && night && (
        <div className="star-layer">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      )}
      {condition === "clear" && !night && <div className="sun-rays" />}
      {(condition === "clouds" ||
        condition === "mist" ||
        condition === "rain" ||
        condition === "storm") && (
        <div className="cloud-layer">
          <i />
          <i />
          <i />
        </div>
      )}
      {(condition === "mist" ||
        condition === "clouds" ||
        condition === "rain" ||
        condition === "storm") && (
        <div className="fog-layer">
          <i />
          <i />
        </div>
      )}
      {condition === "storm" && <div className="ambient-lightning" />}
    </motion.div>
  );
}
