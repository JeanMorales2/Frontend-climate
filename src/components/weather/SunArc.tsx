import { motion } from "motion/react";
import type { Language } from "@/types/weather";
import { translate } from "@/lib/i18n";

export function SunArc({ sunrise, sunset, now, language }: { sunrise: number; sunset: number; now: number; language: Language }) {
  const progress =
    sunset > sunrise ? Math.max(0, Math.min(1, (now - sunrise) / (sunset - sunrise))) : 0;
  const angle = Math.PI - progress * Math.PI;
  const x = 12 + 76 * progress;
  const y = 45 - Math.sin(angle) * 32;
  const time = (timestamp: number) => new Date(timestamp * 1000).toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="sun-arc-wrap">
      <svg className="sun-arc" viewBox="0 0 100 52" role="img" aria-label="Recorrido solar">
      <motion.path
        d="M10 45 Q50 -19 90 45"
        fill="none"
        stroke="currentColor"
        strokeDasharray="3 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r="5"
        fill="#ed9b4d"
        initial={{ cx: 12, cy: 45 }}
        animate={{ cx: x, cy: y }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
      />
      </svg>
      <span className="sun-arc-label sun-arc-start">{translate(language, "sunrise")} · {time(sunrise)}</span>
      <span className="sun-arc-label sun-arc-end">{translate(language, "sunset")} · {time(sunset)}</span>
    </div>
  );
}
