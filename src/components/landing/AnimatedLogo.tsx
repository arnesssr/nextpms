'use client';

import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export const AnimatedLogo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl flex items-center justify-center relative overflow-hidden`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.1 
      }}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main icon */}
      <motion.div
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          delay: 0.3,
          type: "spring",
          stiffness: 200 
        }}
      >
        <Package className={`${iconSizes[size]} text-black relative z-10`} />
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/60 rounded-full"
          initial={{
            x: 0,
            y: 0,
            opacity: 0
          }}
          animate={{
            x: [0, Math.random() * 20 - 10, 0],
            y: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.div>
  );
};