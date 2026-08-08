import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexo — Personas, historias y conexiones",
  description:
    "Una red privada para descubrir perfiles, promociones y conexiones de enrolamiento.",
  openGraph: {
    title: "Nexo",
    description: "Personas. Historias. Conexiones.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Nexo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexo",
    description: "Personas. Historias. Conexiones.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
