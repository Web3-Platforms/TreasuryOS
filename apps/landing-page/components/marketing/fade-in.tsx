'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function FadeIn({ 
  children, 
  className, 
  delay = 0, 
  yOffset = 30,
  duration = 0.7
}: { 
  children: ReactNode; 
  className?: string; 
  delay?: number; 
  yOffset?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
