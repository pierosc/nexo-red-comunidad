import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const socialImage = `${protocol}://${host}/og-v2.png`;

  return {
    title: "Nexo — Personas, historias y conexiones",
    description:
      "Una red privada para descubrir perfiles, promociones y conexiones de enrolamiento.",
    openGraph: {
      title: "Nexo",
      description: "Personas. Historias. Conexiones.",
      type: "website",
      images: [{ url: socialImage, width: 1733, height: 908, alt: "Nexo — Personas. Historias. Conexiones." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Nexo",
      description: "Personas. Historias. Conexiones.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
