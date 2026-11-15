"use client";

import { useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";
import { translate } from "@/lib/i18n";
import type { Language } from "@/types/weather";

type Position = { x: number; y: number; width: number; height: number; tipX: number; tipY: number; arrowX: number; above: boolean };

export function DemoWelcome({ language, demoButtonRef, onClose, onStart }: { language: Language; demoButtonRef: RefObject<HTMLButtonElement | null>; onClose: () => void; onStart: () => void }) {
  const reduced = useReducedMotion();
  const startRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [onClose]);
  useEffect(() => { startRef.current?.focus(); }, []);
  useEffect(() => {
    const update = () => {
      const target = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-demo-target]")).find((button) => button.getBoundingClientRect().width > 0) ?? demoButtonRef.current;
      const rect = target?.getBoundingClientRect();
      if (!rect) return;
      const tipWidth = Math.min(330, window.innerWidth - 32);
      const tipHeight = 178;
      const above = rect.bottom + 38 + tipHeight > window.innerHeight && rect.top > tipHeight + 38;
      const tipX = Math.max(16, Math.min(rect.right - tipWidth, window.innerWidth - tipWidth - 16));
      const tipY = above ? Math.max(16, rect.top - tipHeight - 38) : rect.bottom + 38;
      setPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width + 18, height: rect.height + 18, tipX, tipY, arrowX: Math.max(28, Math.min(rect.left + rect.width / 2 - tipX, tipWidth - 28)), above });
    };
    update();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
    const target = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-demo-target]")).find((button) => button.getBoundingClientRect().width > 0) ?? demoButtonRef.current;
    if (target) observer?.observe(target);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    document.fonts?.ready.then(update).catch(() => undefined);
    return () => { observer?.disconnect(); window.removeEventListener("resize", update); window.removeEventListener("orientationchange", update); };
  }, [demoButtonRef]);
  const isTarget = (event: MouseEvent<HTMLButtonElement>) => position && Math.abs(event.clientX - position.x) <= position.width / 2 && Math.abs(event.clientY - position.y) <= position.height / 2;
  const style = position ? ({ "--spotlight-x": `${position.x}px`, "--spotlight-y": `${position.y}px`, "--spotlight-w": `${position.width}px`, "--spotlight-h": `${position.height}px`, "--tip-x": `${position.tipX}px`, "--tip-y": `${position.tipY}px`, "--tip-arrow-x": `${position.arrowX}px` } as React.CSSProperties) : undefined;
  return (
    <motion.div className="demo-welcome" style={style} role="dialog" aria-modal="true" aria-label={translate(language, "welcomeTitle")}
      initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button className="welcome-backdrop" type="button" aria-label={translate(language, "closeWelcome")} onClick={(event) => isTarget(event) ? onStart() : onClose()} />
      {position && <span className="welcome-halo" aria-hidden="true" />}
      <div className={`welcome-tip${position?.above ? " welcome-tip-above" : ""}`} role="status">
        <span className="welcome-arrow" aria-hidden="true">↗</span>
        <strong>{translate(language, "welcomeTitle")}</strong>
        <p>{translate(language, "welcomeCopy")}</p>
        <button type="button" onClick={onClose}>{translate(language, "welcomeDismiss")}</button>
        <button ref={startRef} className="welcome-start sr-only" type="button" onClick={onStart}>{translate(language, "demo")}</button>
      </div>
    </motion.div>
  );
}
