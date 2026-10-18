import { memo } from "react";

const SkipLink = memo(() => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[2000] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-on-surface focus:text-surface focus:text-xs focus:font-semibold focus:shadow-xl"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
});

SkipLink.displayName = "SkipLink";

export default SkipLink;
