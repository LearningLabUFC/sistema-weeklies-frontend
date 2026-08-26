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
          className="stroke-gray-400 dark:stroke-slate-500"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle
          cx="60"
          cy="8"
          r="6"
          className="fill-indigo-600 dark:fill-indigo-500"
        />

        <rect
          x="20"
          y="30"
          width="80"
          height="75"
          rx="35"
          className="fill-white dark:fill-slate-800 stroke-gray-200 dark:stroke-slate-700"
          strokeWidth="4"
        />
        <rect
          x="32"
          y="48"
          width="56"
          height="38"
          rx="14"
          className="fill-gray-800 dark:fill-slate-900"
        />
        <circle
          cx="48"
          cy="65"
          r="5"
          className="fill-indigo-600 dark:fill-indigo-500"
        />
        <path
          d="M65 60 L75 70 M75 60 L65 70"
          className="stroke-indigo-600 dark:stroke-indigo-500"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx="38"
          cy="75"
          r="3"
          className="fill-red-500/40 dark:fill-red-400/40"
        />
        <circle
          cx="82"
          cy="75"
          r="3"
          className="fill-red-500/40 dark:fill-red-400/40"
        />
        <path
          d="M45 105 L55 120 L65 120 L75 105"
          className="fill-gray-300 dark:fill-slate-600"
        />
        <motion.path
          animate={{
            d: [
              'M55 120 Q60 145 65 120',
              'M55 120 Q60 130 65 120',
              'M55 120 Q60 145 65 120',
            ],
          }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          className="fill-indigo-600/80 dark:fill-indigo-500/80"
        />
      </svg>
    </motion.div>
  );
}
