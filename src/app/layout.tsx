import type { Metadata } from "next";
import { Bebas_Neue, Montserrat, Special_Elite } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Interrogation Room",
  description: "Two detectives. One suspect. No escape.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${bebasNeue.variable} ${specialElite.variable} ${montserrat.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
