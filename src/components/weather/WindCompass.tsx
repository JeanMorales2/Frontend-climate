"use client";

import { motion } from "motion/react";
import { formatWindDirection } from "@/lib/format";
import type { Language } from "@/types/weather";

export function WindCompass({ degrees, language }: { degrees: number; language: Language }) {
  return (
    <div
      className="wind-compass"
      role="img"
      aria-label={`${formatWindDirection(degrees, language)} ${degrees}°`}
    >
      <span>N</span>
      <motion.i
        animate={{ rotate: degrees }}
        transition={{ type: "spring", stiffness: 80, damping: 14 }}
      >
        ↑
      </motion.i>
    </div>
  );
}
