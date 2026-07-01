import { Inter, Geist_Mono, Montserrat } from "next/font/google";

/** Cuerpo: Inter (legible en móvil). */
export const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Títulos: Montserrat — línea gráfica municipal (bold, geométrica). */
export const fontHeading = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const fontClassNames = [fontSans.variable, fontHeading.variable, fontMono.variable].join(
  " ",
);
