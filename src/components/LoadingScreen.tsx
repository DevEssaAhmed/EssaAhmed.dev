"use client";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-[3px] border-outline-variant/40 border-t-primary animate-spin" />
      </div>
      <p className="mt-6 text-sm font-mono text-on-surface-variant tracking-wider animate-pulse">
        Loading, please wait...
      </p>
    </div>
  );
};

export default LoadingScreen;
