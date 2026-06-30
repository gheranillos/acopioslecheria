import { Inter, Geist_Mono } from "next/font/google";

/** Sans-serif neutra — Inter con fallback Helvetica del sistema. */
export const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const fontClassNames = [fontSans.variable, fontMono.variable].join(" ");
