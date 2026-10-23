"use client";

import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface">
      {/* Soft pulsing ring */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-14 h-14 rounded-full border-[3px] border-outline-variant/40 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </motion.div>

      {/* Gentle text shimmer */}
      <motion.p
        className="mt-6 text-sm font-mono text-on-surface-variant tracking-wider"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        Loading, please wait...
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
