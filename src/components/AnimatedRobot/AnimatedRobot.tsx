import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface AnimatedRobotProps {
  className?: string;
}

export function AnimatedRobot({ className }: AnimatedRobotProps) {
  return (
    <motion.div
      animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className={cn('absolute top-10 md:top-4 z-20', className)}
    >
      <svg
        viewBox="0 0 120 140"
        className="w-28 md:w-32 drop-shadow-2xl overflow-visible"
      >
        <path
          d="M60 30 L60 10"
          stroke="#9CA3AF"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="60" cy="8" r="6" fill="#4F46E5" />

        <rect
          x="20"
          y="30"
          width="80"
          height="75"
          rx="35"
          fill="#FFFFFF"
          stroke="#E5E7EB"
          strokeWidth="4"
        />
        <rect x="32" y="48" width="56" height="38" rx="14" fill="#1F2937" />
        <circle cx="48" cy="65" r="5" fill="#4F46E5" />
        <path
          d="M65 60 L75 70 M75 60 L65 70"
          stroke="#4F46E5"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="38" cy="75" r="3" fill="#EF4444" opacity="0.4" />
        <circle cx="82" cy="75" r="3" fill="#EF4444" opacity="0.4" />
        <path d="M45 105 L55 120 L65 120 L75 105" fill="#D1D5DB" />
        <motion.path
          animate={{
            d: [
              'M55 120 Q60 145 65 120',
              'M55 120 Q60 130 65 120',
              'M55 120 Q60 145 65 120',
            ],
          }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          fill="#4F46E5"
          opacity="0.8"
        />
      </svg>
    </motion.div>
  );
}
