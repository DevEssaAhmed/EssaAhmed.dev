import { memo } from 'react';

const SkipLink = memo(() => {
  return (
    <a 
      href="#main-content" 
      className="skip-link"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
});

SkipLink.displayName = 'SkipLink';

export default SkipLink;
