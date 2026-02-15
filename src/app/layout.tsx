import type { Metadata } from "next";
import "../index.css";
import Providers from "./providers";
import GTMProvider from "@/components/gtm-provider";
import GTMPageView from "@/components/gtm-pageview";

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
    images: [{ url: "/og-image.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@DevEssaAhmed",
    images: ["/placeholder.svg"],
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
    <html>
      <head>
        <link
          rel="preconnect"
          href="https://kexmzaaufxbzegurxuqz.supabase.co"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <GTMPageView />
          {children}
          <GTMProvider />
        </Providers>
      </body>
    </html>
  );
}
