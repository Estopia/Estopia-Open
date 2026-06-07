import type { Metadata } from "next";
import { Geist, Geist_Mono, Chivo } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const chivo = Chivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://open.estopia.net"),
  title: {
    default: "Estopia Engineering Open Source",
    template: "%s | Estopia Engineering",
  },
  description:
    "Open source software built and maintained by Estopia Engineering Ltd.",
  openGraph: {
    title: "Estopia Engineering Open Source",
    description:
      "Discover and contribute to the open source software from Estopia Engineering Ltd.",
    url: "https://open.estopia.net",
    siteName: "open.estopia.net",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${chivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
