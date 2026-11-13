"use client";

import { motion } from "motion/react";
import { useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

export function AnimatedNumber({
  value,
  className = "",
}: {
  value: string | number;
  className?: string;
}) {
  const numeric = typeof value === "number" ? value : Number.parseFloat(value);
  const spring = useSpring(Number.isFinite(numeric) ? numeric : 0, { stiffness: 65, damping: 18 });
  const formatted = useTransform(spring, (current) => {
    if (typeof value === "number") return `${Math.round(current)}`;
    const match = String(value).match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
    if (!match) return String(value);
    const decimals = match[2].split(".")[1]?.length ?? 0;
    return `${match[1]}${current.toFixed(decimals)}${match[3]}`;
  });
  useEffect(() => {
    spring.set(Number.isFinite(numeric) ? numeric : 0);
  }, [numeric, spring]);
  return (
    <motion.span
      key={value}
      className={className}
      aria-label={String(value)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {formatted}
    </motion.span>
  );
}
