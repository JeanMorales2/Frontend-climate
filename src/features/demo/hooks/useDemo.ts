"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDemoSteps, type DemoStep } from "../demo";
import type { Language } from "@/types/weather";

const STEP_MS = 3000;

export function useDemo(language: Language) {
  const steps = useMemo(() => createDemoSteps(language), [language]);
  const [index, setIndex] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const running = index !== null;
  const stop = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setIndex(null);
  }, []);
  const start = useCallback(() => setIndex(0), []);

  useEffect(() => {
    if (index === null) return;
    timer.current = window.setTimeout(() => {
      setIndex((current) => (current === null || current >= steps.length - 1 ? null : current + 1));
    }, STEP_MS);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [index, steps.length]);

  useEffect(() => () => stop(), [stop]);
  return { running, step: index === null ? null : (steps[index] as DemoStep), index, total: steps.length, start, stop };
}
