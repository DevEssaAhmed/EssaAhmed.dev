import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
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

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "700"],
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

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://essaahmed.dev/#person",
  name: "Essa Ahmed",
  url: "https://essaahmed.dev",
  jobTitle: "Industrial & Systems Engineer, Systems Architect",
  sameAs: [
    "https://github.com/DevEssaAhmed",
    "https://www.linkedin.com/in/essa-ahmed",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://essaahmed.dev"),
  title: "Essa Ahmed",
  description:
    "Portfolio of Essa Ahmed, an industrial and manufacturing engineer working across quality improvement, data analytics, Power BI dashboards, and automation.",
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48 64x64" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#374EAE" }],
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
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`(()=>{try{const saved=localStorage.getItem('theme');const theme=saved==='light'||saved==='dark'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');const root=document.documentElement;root.classList.remove('light','dark');root.classList.add(theme);root.style.colorScheme=theme}catch{const theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.classList.add(theme)}})()`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <link
          rel="preconnect"
          href="https://kexmzaaufxbzegurxuqz.supabase.co"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="bg-surface text-on-surface antialiased selection:bg-primary/20 selection:text-primary min-h-screen transition-colors duration-200"
        suppressHydrationWarning
      >
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
