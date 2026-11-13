import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
export const metadata: Metadata = {
  title: "Clima | Tu tiempo, de un vistazo",
  description: "Consulta el tiempo y el pronóstico de cualquier ciudad.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="theme-system" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var p=JSON.parse(localStorage.getItem('clima-preferencias')||'{}');var t=p.state&&p.state.theme;document.documentElement.className='theme-'+(t==='dark'||t==='light'?t:'system')}catch(e){}",
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
