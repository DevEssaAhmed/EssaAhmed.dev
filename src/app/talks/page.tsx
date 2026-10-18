import Navigation from "@/components/Navigation";
import OptimizedFooter from "@/components/OptimizedFooter";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = {
  ...buildPageMetadata({
    title: "Talks & Sessions",
    description: "Talks, workshops, and sessions by Essa Ahmed.",
    path: "/talks",
  }),
  robots: { index: false, follow: true },
};

export default function TalksPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30 selection:text-primary flex flex-col justify-between transition-colors duration-200">
      <Navigation />

      <main
        id="main-content"
        tabIndex={-1}
        className="w-full max-w-[1080px] mx-auto px-6 pt-16 pb-24 flex-1"
      >
        <section className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-secondary text-label-sm font-label-sm uppercase tracking-wider mb-5">
            Speaking · Workshops · Sessions
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-on-surface mb-4">
            Talks &amp; Sessions
          </h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg leading-relaxed">
            A home for talks, workshops, and conversations about workflow automation,
            supply chain systems, and practical analytics.
          </p>
        </section>

        <section
          aria-labelledby="talks-empty-heading"
          className="mt-12 rounded-3xl border border-outline-variant/30 bg-surface-container-low p-8 sm:p-10"
        >
          <h2
            id="talks-empty-heading"
            className="text-xl font-display font-semibold text-on-surface"
          >
            Sessions will appear here
          </h2>
          <p className="mt-2 max-w-2xl text-on-surface-variant leading-relaxed">
            This page is ready for upcoming and past sessions. There are no talks published yet.
          </p>
        </section>
      </main>

      <OptimizedFooter />
    </div>
  );
}
