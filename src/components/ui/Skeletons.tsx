import type { Language } from "@/types/weather";
import { translate } from "@/lib/i18n";

export function Skeletons({ language }: { language: Language }) {
  return (
    <div className="panel loading" aria-label={translate(language, "loading")}>
      <span />
      <span />
      <span />
    </div>
  );
}
