import { getCondition } from "@/lib/conditions";

export function WeatherIcon({
  code,
  className = "weather-icon",
}: {
  code: string;
  className?: string;
}) {
  const condition = getCondition(code);
  const night = code.endsWith("n");
  return (
    <svg
      className={`${className} icon-${condition}`}
      viewBox="0 0 96 96"
      role="img"
      aria-label={condition}
    >
      {condition === "clear" ? (
        night ? (
          <g className="night-sky">
            <path d="M58 17a29 29 0 1 0 23 47A31 31 0 0 1 58 17Z" fill="#e9d7a8" />
            <circle cx="28" cy="25" r="2" fill="#e9d7a8" />
            <circle cx="35" cy="12" r="1.5" fill="#e9d7a8" />
          </g>
        ) : (
          <>
            <circle className="sun-core" cx="48" cy="42" r="18" fill="#f3ae55" />
            <path
              d="M48 8v10m0 48v10M14 42h10m48 0h10M24 18l7 7m34 34 7 7m0-48-7 7M31 59l-7 7"
              stroke="#e99949"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        )
      ) : (
        <>
          {condition !== "mist" && <circle cx="62" cy="30" r="14" fill="#f4bd68" />}
          <path
            className="weather-cloud"
            d="M25 67h45a13 13 0 0 0 0-26 22 22 0 0 0-42-4 15 15 0 0 0-3 30Z"
            fill="#e5edf0"
            stroke="#a8bbc3"
            strokeWidth="3"
          />
          {(condition === "rain" || condition === "storm") && (
            <path
              className="weather-rain"
              d="m34 73-5 10m22-10-5 10m22-10-5 10"
              stroke="#63a8c1"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}
          {condition === "snow" && (
            <path
              className="weather-snow"
              d="M34 77h.1M50 82h.1M66 77h.1"
              stroke="#73b4cd"
              strokeWidth="7"
              strokeLinecap="round"
            />
          )}
          {condition === "storm" && (
            <path className="weather-flash" d="m51 67-8 13h8l-3 10 13-16h-8l4-7" fill="#e6aa45" />
          )}
        </>
      )}
    </svg>
  );
}
