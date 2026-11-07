import AboutPage from "./AboutPage";
import { getSupabaseServer } from "@/lib/supabase-server";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "About",
  description: "Learn about Essa Ahmed, an industrial and manufacturing engineer focused on quality improvement, data analytics, Power BI dashboards, and operations.",
  path: "/about",
});

export default async function Page() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("profile")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  const person: any = data || {};
  const sameAs = Array.from(
    new Set(
      [
        person.github_url,
        person.linkedin_url,
        person.website_url,
        "https://github.com/DevEssaAhmed",
        "https://www.linkedin.com/in/essa-ahmed/",
      ].filter(
        (value): value is string =>
          typeof value === "string" && value.startsWith("https://")
      )
    )
  );
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": "https://essaahmed.dev/about#profile",
    url: "https://essaahmed.dev/about",
    name: "About " + (person.name || "Essa Ahmed"),
    mainEntity: {
      "@type": "Person",
      "@id": "https://essaahmed.dev/#person",
      name: person.name || "Essa Ahmed",
      url: "https://essaahmed.dev/about",
      ...(person.title ? { jobTitle: person.title } : {}),
      description:
        person.bio ||
        "Industrial and manufacturing engineering, quality improvement, data analytics, Power BI dashboards, and automation.",
      sameAs,
      ...(typeof person.avatar_url === "string" &&
      person.avatar_url.startsWith("https://") &&
      !person.avatar_url.includes("placeholder.svg")
        ? { image: person.avatar_url }
        : {}),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profileJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AboutPage initialProfile={data || undefined} />
    </>
  );
}

