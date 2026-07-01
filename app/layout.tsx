import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { fontClassNames } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acopios Lechería",
  description:
    "Coordinación de ayuda humanitaria post-terremoto en Anzoátegui: centros de acopio, zonas de refugio y necesidades en tiempo real.",
  icons: {
    icon: "/logo-acopios-lecheria.png",
    apple: "/logo-acopios-lecheria.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#001d3d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fontClassNames} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
