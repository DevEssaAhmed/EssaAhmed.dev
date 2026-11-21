import type { Metadata } from "next";
import LabPage from "./LabPage";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "S&OP Decision Lab",
  description:
    "Interactive stochastic safety stock, reorder point, and lead-time variance simulator with live Python, SQL, and Power BI DAX code.",
  path: "/lab",
  badge: "Interactive Lab",
});

export default function Page() {
  const labJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": "https://essaahmed.dev/lab#app",
    name: "S&OP Safety Stock & Reorder Simulator",
    url: "https://essaahmed.dev/lab",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    description:
      "Interactive stochastic safety stock, reorder point, and lead-time variance simulator with live Python, SQL, and Power BI DAX code.",
    author: {
      "@type": "Person",
      name: "Essa Ahmed",
      url: "https://essaahmed.dev",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(labJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <LabPage />
    </>
  );
}
