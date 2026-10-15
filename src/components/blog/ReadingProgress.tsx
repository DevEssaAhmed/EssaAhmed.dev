import { useState, useEffect } from 'react';

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-background/20 backdrop-blur-sm">
      <div
        className="h-full bg-champagne transition-all duration-150 ease-out shadow-[0_0_12px_rgba(243,232,210,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ReadingProgress;