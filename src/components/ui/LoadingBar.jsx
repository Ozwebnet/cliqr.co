import React from 'react';
import { motion } from 'framer-motion';

const LoadingBar = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-10">
      <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 1.2,
            ease: "linear",
          }}
        />
      </div>
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
};

export default LoadingBar;