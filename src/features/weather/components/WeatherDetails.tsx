import { Cloud, Eye, Gauge, Sunrise, Sunset, Thermometer } from "lucide-react";
import { translate } from "@/lib/i18n";
import type { Language, Unit, Weather } from "@/types/weather";
import { formatTemperature } from "@/utils/format";
import { HumidityRing } from "./HumidityRing";
import { WindCompass } from "./WindCompass";
import { SunArc } from "./SunArc";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { motion } from "motion/react";

export function WeatherDetails({
  weather,
  language,
  unit,
}: {
  weather: Weather;
  language: Language;
  unit: Unit;
}) {
  const now = Math.floor(Date.now() / 1000);
  return (
    <motion.article
      className="panel details"
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
    >
      <h2>{translate(language, "details")}</h2>
      <div className="detail-grid">
        <motion.div
          className="detail-item"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <Thermometer />
          <span>{translate(language, "feelsLike")}</span>
          <strong>
            <AnimatedNumber value={formatTemperature(weather.feelsLike, unit)} />
          </strong>
        </motion.div>
        <motion.div
          className="detail-item"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <span className="detail-graphic">
            <HumidityRing value={weather.humidity} />
          </span>
          <span>{translate(language, "humidity")}</span>
          <strong>
            <AnimatedNumber value={`${weather.humidity}%`} />
          </strong>
        </motion.div>
        <motion.div
          className="detail-item"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <span className="detail-graphic">
            <WindCompass degrees={weather.windDegrees} language={language} />
          </span>
          <span>{translate(language, "wind")}</span>
          <strong>
            <AnimatedNumber value={`${weather.windSpeed} m/s`} />
          </strong>
        </motion.div>
        <motion.div
          className="detail-item"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <Gauge />
          <span>{translate(language, "pressure")}</span>
          <strong>
            <AnimatedNumber value={`${weather.pressure} hPa`} />
          </strong>
        </motion.div>
        <motion.div
          className="detail-item"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <Eye />
          <span>{translate(language, "visibility")}</span>
          <strong>
            {weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : "—"}
          </strong>
        </motion.div>
        <motion.div
          className="detail-item"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <Cloud />
          <span>{translate(language, "clouds")}</span>
          <strong>{weather.clouds}%</strong>
        </motion.div>
        <motion.div
          className="detail-item sun-item"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <Sunrise />
          <span>{translate(language, "sunrise")}</span>
          <strong>
            {new Date(weather.sunrise * 1000).toLocaleTimeString(language, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </strong>
        </motion.div>
        <motion.div
          className="detail-item sun-item"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <Sunset />
          <span>{translate(language, "sunset")}</span>
          <strong>
            {new Date(weather.sunset * 1000).toLocaleTimeString(language, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </strong>
        </motion.div>
        <div className="sun-arc-item">
          <SunArc sunrise={weather.sunrise} sunset={weather.sunset} now={now} language={language} />
        </div>
      </div>
    </motion.article>
  );
}
