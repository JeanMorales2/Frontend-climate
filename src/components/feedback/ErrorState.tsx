import type { Language } from "@/types/weather";
import { translate } from "@/lib/i18n";

export function ErrorState({ language, code }: { language: Language; code: string }) {
  const notFound = code === "CITY_NOT_FOUND";
  return (
    <section className="panel error" role="alert">
      <strong>{translate(language, notFound ? "notFound" : "error")}</strong>
      <p>{translate(language, "errorCopy")}</p>
    </section>
  );
}
