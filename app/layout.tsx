import type { Metadata, Viewport } from "next";
import { Playfair_Display, Bebas_Neue, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Don't Waste Our Time — A Public Ledger of Wasted Time",
  description:
    "A citizen-journalism platform curating public evidence of civic neglect, institutional delay, and public inefficiency in India. Submit a link. We log it. Publicly, permanently.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Don't Waste Our Time",
    description:
      "A public ledger of civic neglect, institutional delay, and public inefficiency in India.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${bebas.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
