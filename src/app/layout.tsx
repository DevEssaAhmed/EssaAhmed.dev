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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://essaahmed.dev/#website",
  name: "Essa Ahmed",
  url: "https://essaahmed.dev/",
  description: "Portfolio of Essa Ahmed covering industrial engineering, quality improvement, data analytics, dashboards, and automation.",
  inLanguage: "en",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://essaahmed.dev"),
  title: "Essa Ahmed",
  description: "Portfolio of Essa Ahmed, an industrial and manufacturing engineer working across quality improvement, data analytics, Power BI dashboards, and automation.",
  applicationName: "Essa Ahmed",
  authors: [{ name: "Essa Ahmed" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.svg" }],
  },
  openGraph: {
    title: "Essa Ahmed",
    description:
      "Industrial engineering, quality improvement, data analytics, dashboards, automation projects, and writing by Essa Ahmed.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Essa Ahmed" }],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
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
