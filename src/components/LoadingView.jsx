import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_TEXTS = [
  "Analyzing your skills & technical experience...",
  "Querying Gemini 2.0 Flash agent...",
  "Evaluating preferences against 50+ tech careers...",
  "Compiling growth metrics and India-specific salary data...",
  "Formatting custom month-by-month roadmap milestones...",
  "Almost there! Wrapping up dashboard details..."
];

function LoadingView() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % STATUS_TEXTS.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto text-center flex flex-col items-center justify-center min-h-[450px]">
      {/* Animated Orb Container */}
      <div className="relative h-44 w-44 mb-10 flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primaryViolet to-primaryIndigo opacity-20 blur-xl animate-pulse"></div>
        
        {/* Inner rotating gradient rings */}
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-primaryViolet/30 animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-4 rounded-full border border-dashed border-primaryIndigo/40 animate-[spin_6s_linear_infinite_reverse]"></div>
        
        {/* Central Glowing Glass Orb */}
        <div className="absolute inset-8 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center justify-center shadow-inner">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primaryViolet to-primaryIndigo shadow-lg shadow-primaryViolet/40 animate-ping"></div>
          <div className="absolute h-6 w-6 rounded-full bg-gradient-to-tr from-primaryViolet to-primaryIndigo shadow-lg shadow-primaryViolet/50"></div>
        </div>
      </div>

      {/* Progress Message */}
      <div className="h-14 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-base font-semibold text-white tracking-wide"
          >
            {STATUS_TEXTS[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-xs text-secondaryGray mt-4 max-w-xs leading-relaxed">
        Our AI agent is building a structured career profile. This takes a brief moment to map and optimize.
      </p>
    </div>
  );
}

export default LoadingView;
