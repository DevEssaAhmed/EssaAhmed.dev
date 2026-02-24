import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "../index.css";
import Providers from "./providers";
import GTMProvider from "@/components/gtm-provider";
import GTMPageView from "@/components/gtm-pageview";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://essaahmed.dev"),
  title: "Essa Ahmed",
  description: "Explore articles, projects, and analytics-driven insights.",
  applicationName: "Essa Ahmed",
  authors: [{ name: "Essa Ahmed" }],
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.svg" }],
  },
  openGraph: {
    title: "Essa Ahmed - Portfolio & Blog",
    description:
      "Design-forward portfolio and journal. Data visualizations, projects, and writing.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Essa Ahmed - Portfolio & Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevEssaAhmed",
    images: ["/og-image.png"],
  },
  verification: {
    google: "FYfYBNT6h1kpZ8TJMt_ZYOZbOK00MX8ZeuLnroemaGc",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <link
          rel="preconnect"
          href="https://kexmzaaufxbzegurxuqz.supabase.co"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <Suspense fallback={null}>
            <GTMPageView />
          </Suspense>
          {children}
          <GTMProvider />
        </Providers>
      </body>
    </html>
  );
}
