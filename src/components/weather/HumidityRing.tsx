"use client";

import { motion } from "motion/react";

export function HumidityRing({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <motion.div
      className="humidity-ring"
      role="img"
      aria-label={`Humedad ${safeValue}%`}
      style={{ "--humidity": `${safeValue}%` } as React.CSSProperties}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
    >
      <span>{safeValue}%</span>
    </motion.div>
  );
}
