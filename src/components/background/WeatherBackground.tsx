"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { getCondition } from "@/lib/conditions";
import { createParticles, drawParticles } from "@/components/background/particles";

export function WeatherBackground({ icon }: { icon?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 35, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 35, damping: 20 });
  const condition = getCondition(icon ?? "01d");
  const night = icon?.endsWith("n") ?? false;
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (condition !== "storm") return;
    let timeout = 0;
    let active = true;
    const schedule = () => {
      timeout = window.setTimeout(
        () => {
          if (!active) return;
          setFlash(true);
          window.setTimeout(() => setFlash(false), 180);
          schedule();
        },
        4500 + Math.random() * 9500,
      );
    };
    schedule();
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [condition]);

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
        Math.max(12, Math.floor(width / (width < 600 ? 36 : 19))),
      );
    };
    let particles = createParticles(width, height, 20);
    const animate = (time: number) => {
      if (document.hidden) return;
      drawParticles(context!, particles, width, height, condition, time);
      frame = requestAnimationFrame(animate);
    };
    const visibility = () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else frame = requestAnimationFrame(animate);
    };
    resize();
    frame = requestAnimationFrame(animate);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [condition]);

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
