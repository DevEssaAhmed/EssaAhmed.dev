import type { Metadata } from "next";
import Script from "next/script";
import "../index.css";
import Providers from "./providers";

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

const gtmLoaderScript = `
  function loadGTM() {
    if (window.gtmDidInit) return;
    window.gtmDidInit = true;

    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", "GTM-N5VQ53PG");
  }

  const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
  events.forEach(function (event) {
    window.addEventListener(event, loadGTM, { once: true, passive: true });
  });

  setTimeout(loadGTM, 3500);
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://kexmzaaufxbzegurxuqz.supabase.co"
          crossOrigin="anonymous"
        />
        <style>{`:root{--background:210 20% 98%;--foreground:220 15% 25%;--card:0 0% 100%;--card-foreground:220 15% 25%;--primary:217 91% 60%;--primary-foreground:0 0% 100%;--muted:210 20% 95%;--muted-foreground:220 10% 55%;--border:214.3 31.8% 91.4%;--radius:.5rem}.dark{--background:222 15% 6%;--foreground:210 15% 97%;--card:222 14% 9%;--card-foreground:210 12% 98%;--primary:258 95% 70%;--primary-foreground:0 0% 100%;--muted:220 15% 15%;--muted-foreground:210 10% 72%;--border:220 15% 22%}*{border-color:hsl(var(--border))}body{background-color:hsl(var(--background));color:hsl(var(--foreground));margin:0;font-family:system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}#root{min-height:100vh;display:flex;flex-direction:column}.nav-fixed{position:fixed;top:0;left:0;right:0;z-index:50}`}</style>
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>

        <Script id="gtm-deferred-loader" strategy="afterInteractive">
          {gtmLoaderScript}
        </Script>

        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N5VQ53PG"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      </body>
    </html>
  );
}
