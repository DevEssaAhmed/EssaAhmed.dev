"use client";

import { useEffect } from "react";
import { GTM_ID } from "@/lib/gtm";

declare global {
  interface Window {
    gtmDidInit?: boolean;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export default function GTMProvider() {
  useEffect(() => {
    const loadGTM = () => {
      if (window.gtmDidInit) return;
      window.gtmDidInit = true;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        "gtm.start": new Date().getTime(),
        event: "gtm.js",
      });

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      document.head.appendChild(script);
    };

    const events = ["mousedown", "touchstart", "scroll", "keydown"];
    events.forEach((eventName) =>
      window.addEventListener(eventName, loadGTM, { once: true, passive: true })
    );

    const timeout = window.setTimeout(loadGTM, 3500);

    return () => {
      window.clearTimeout(timeout);
      events.forEach((eventName) =>
        window.removeEventListener(eventName, loadGTM)
      );
    };
  }, []);

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
