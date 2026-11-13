import type { Language } from "@/types/weather";
import { translate } from "@/lib/i18n";

export function ErrorState({ language, code }: { language: Language; code: string }) {
  // Solo "ciudad no encontrada" depende de lo que escribió el usuario;
  // el resto son fallos del servicio y no tiene sentido pedirle que revise el nombre.
  const notFound = code === "CITY_NOT_FOUND";
  return (
    <section className="panel error" role="alert">
      <strong>{translate(language, notFound ? "notFound" : "error")}</strong>
      <p>{translate(language, notFound ? "errorCopy" : "serviceCopy")}</p>
    </section>
  );
}
