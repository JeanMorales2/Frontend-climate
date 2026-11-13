import { CloudSun } from "lucide-react";
import type { Language } from "@/types/weather";
import { translate } from "@/lib/i18n";

export function EmptyState({ language }: { language: Language }) {
  return (
    <section className="empty-state">
      <div className="empty-orb">
        <CloudSun size={35} aria-hidden="true" />
      </div>
      <p>{translate(language, "emptyTitle")}</p>
      <span>{translate(language, "emptyCopy")}</span>
    </section>
  );
}
