import type { Metadata, Viewport } from "next";
// taste-skill-ignore: Geist Mono sets the shell, which is literal code.
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import { site } from "@/app/lib/site";
import "./globals.css";

// The Estopia brand face, as on estopia.net.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

// Literal code only: the shell.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

const title = `${site.org} — Open Source`;

export const metadata: Metadata = {
  title,
  description: site.description,
  applicationName: "Estopia Open Source",
  keywords: [
    "Estopia",
    "Estopia Engineering",
    "open source",
    "terminal",
    "command line",
    "projects",
  ],
  authors: [{ name: site.orgLegal, url: site.mainSite }],
  creator: site.orgLegal,
  openGraph: {
    title,
    description: site.description,
    siteName: title,
    url: site.mainSite,
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1113" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${geistMono.variable} antialiased`} // taste-skill-ignore: the shell font
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
