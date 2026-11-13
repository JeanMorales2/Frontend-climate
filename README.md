# Cielo

Aplicación responsive para consultar el clima actual y el pronóstico de cinco días. Incluye búsqueda con sugerencias, ciudades recientes, preferencias de unidad, tema e idioma.

## Requisitos

- Node.js 20 o posterior y npm.
- Una clave de API de OpenWeather (https://openweathermap.org/api).

## Configuración

1. Copia .env.example a .env.local.
2. Añade tu clave: OPENWEATHER_API_KEY=tu_clave.
3. Instala dependencias con npm install.
4. Arranca el entorno local con npm run dev.
5. Abre http://localhost:3000.

La clave solo se utiliza en los route handlers del servidor y no se incluye en las respuestas enviadas al navegador.

## Pruebas y calidad

- npm test: ejecuta Jest.
- npm run test:coverage: ejecuta Jest con cobertura global mínima del 80 % en branches, functions, lines y statements.
- npm run lint: analiza el proyecto con ESLint.
- npm run typecheck: comprueba los tipos TypeScript.
- npm run build: crea la aplicación de producción.

Las pruebas usan respuestas simuladas y no realizan llamadas reales a OpenWeather. Se incluyen pruebas unitarias de utilidades y store, pruebas de hooks y componentes, y pruebas de los route handlers en entorno Node.

El bucle de dibujo de partículas está aislado en `src/components/background/particles.ts` y se excluye de cobertura porque depende de un `CanvasRenderingContext2D` y del reloj de animación del navegador. La integración del fondo se mantiene en los componentes de interfaz.

## Estructura

- src/app: página, estilos, providers y endpoints de clima, pronóstico y geocodificación.
- src/components: búsqueda, presentación meteorológica, fondo, estados y controles.
- src/hooks: consultas, sugerencias, debounce y media queries.
- src/lib: cliente de OpenWeather, mapeos, formatos, traducciones y condiciones.
- src/store: preferencias persistidas.
- src/types: contratos de datos de clima.

## Decisiones técnicas

- La API key vive en el servidor; los endpoints devuelven contratos propios en lugar de la respuesta cruda del proveedor.
- El pronóstico de intervalos de tres horas se agrupa por fecha y combina mínimas y máximas para mostrar hasta cinco días.
- Las preferencias y hasta seis búsquedas recientes se guardan en el navegador.
- Los iconos meteorológicos se dibujan como SVG locales.

Las capturas de referencia visual se añadirán durante la revisión final del producto.

## Despliegue con Docker / Dokploy

La aplicación escucha en el puerto `3000`. Configura `OPENWEATHER_API_KEY` como variable de entorno en Dokploy o en un archivo `.env` local. La clave se lee en tiempo de ejecución desde las rutas de API y no se necesita durante la compilación.

Para desplegar en Dokploy, crea un servicio Docker Compose desde la carpeta del proyecto o desde un ZIP que contenga el `Dockerfile` y `docker-compose.yml`. Configura el dominio en Dokploy y apunta el destino del proxy al puerto interno `3000` del servicio `web`.

Comandos disponibles desde esta carpeta:

```sh
docker build -t cielo .
docker run --rm -p 3000:3000 -e OPENWEATHER_API_KEY=tu_clave cielo
docker compose up --build
```

Para cambiar el puerto local publicado con Compose, define `WEB_PORT` (por ejemplo, `WEB_PORT=8080`) en el entorno o en `.env`. El servicio conserva el puerto interno `3000`.
