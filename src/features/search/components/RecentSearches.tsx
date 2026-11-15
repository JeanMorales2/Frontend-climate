"use client";

import { X } from "lucide-react";
import type { Language } from "@/types/weather";
import { translate } from "@/lib/i18n";
import { AnimatePresence, motion } from "motion/react";

type RecentSearchesProps = {
  cities: string[];
  language: Language;
  onSelect: (city: string) => void;
  onRemove: (city: string) => void;
  onClear: () => void;
};

export function RecentSearches({
  cities,
  language,
  onSelect,
  onRemove,
  onClear,
}: RecentSearchesProps) {
  if (!cities.length) return null;
  return (
    <div className="recent">
      <span>{translate(language, "recent")}</span>
      <AnimatePresence mode="popLayout">
        {cities.map((city) => (
          <motion.span
            className="recent-chip"
            key={city}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
          >
            <button type="button" onClick={() => onSelect(city)}>
              {city}
            </button>
            <button type="button" aria-label={`Quitar ${city}`} onClick={() => onRemove(city)}>
              <X size={13} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <button className="clear-recent" type="button" onClick={onClear}>
        {translate(language, "clearRecent")}
      </button>
    </div>
  );
}
