import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/app/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  themeColor: "#070b09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
