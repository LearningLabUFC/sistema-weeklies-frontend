import { Home } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

import { AnimatedRobot } from '@/components/shared/AnimatedRobot/AnimatedRobot';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans transition-colors">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/10 dark:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full flex flex-col items-center text-center relative z-10">
        <div className="w-full h-64 md:h-80 relative mb-8 flex justify-center items-end">
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
            <span className="text-[140px] md:text-[200px] font-black text-indigo-600/5 dark:text-indigo-500/10 tracking-tighter leading-none">
              404
            </span>
          </div>

          <motion.div
            animate={{
              opacity: [0, 1, 0],
              y: [0, -30],
              scale: [0.8, 1.2, 0.8],
              rotate: [-15, 15, -15],
            }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.2 }}
            className="absolute top-10 left-[20%] text-4xl font-bold text-indigo-600/40 dark:text-indigo-400/40 select-none"
          >
            ?
          </motion.div>
          <motion.div
            animate={{
              opacity: [0, 1, 0],
              y: [0, -20],
              scale: [0.6, 1, 0.6],
              rotate: [15, -15, 15],
            }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 1.5 }}
            className="absolute top-20 right-[25%] text-2xl font-bold text-gray-400/60 dark:text-slate-600/60 select-none"
          >
            ?
          </motion.div>

          <AnimatedRobot />

          <div className="w-full max-w-75 z-10 -mb-2.5 md:mb-0">
            <svg
              viewBox="0 0 300 120"
              className="w-full overflow-visible drop-shadow-sm"
            >
              <path
                d="M 40 110 Q 150 130 250 105 Q 280 100 290 110 Q 150 140 40 110 Z"
                className="fill-indigo-600/10 dark:fill-indigo-500/20"
              />

              <g transform="translate(50, 65)">
                <rect
                  x="-10"
                  y="20"
                  width="110"
                  height="16"
                  rx="3"
                  className="fill-white dark:fill-slate-800 stroke-gray-300 dark:stroke-slate-700"
                  strokeWidth="2"
                  transform="rotate(-3)"
                />
                <rect
                  x="-5"
                  y="5"
                  width="105"
                  height="14"
                  rx="3"
                  className="fill-gray-100 dark:fill-slate-900 stroke-gray-300 dark:stroke-slate-700"
                  strokeWidth="2"
                  transform="rotate(2)"
                />
                <rect
                  x="0"
                  y="-10"
                  width="90"
                  height="16"
                  rx="3"
                  className="fill-white dark:fill-slate-800 stroke-gray-300 dark:stroke-slate-700"
                  strokeWidth="2"
                  transform="rotate(-1)"
                />
                <line
                  x1="5"
                  y1="20"
                  x2="5"
                  y2="36"
                  className="stroke-gray-300 dark:stroke-slate-700"
                  strokeWidth="2"
                  transform="rotate(-3)"
                />
                <line
                  x1="8"
                  y1="5"
                  x2="8"
                  y2="19"
                  className="stroke-gray-300 dark:stroke-slate-700"
                  strokeWidth="2"
                  transform="rotate(2)"
                />
              </g>

              <g transform="translate(200, 55)">
                <path
                  d="M -5 50 L 45 50 Q 35 35 25 35 Q 15 45 -5 50 Z"
                  className="fill-indigo-600/25 dark:fill-indigo-500/30"
                />
                <path
                  d="M 15 0 L 25 0 L 25 15 L 45 50 L -5 50 L 15 15 Z"
                  fill="none"
                  className="stroke-gray-400 dark:stroke-slate-500"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M -5 50 L 10 35 L 15 45 L 25 30"
                  fill="none"
                  className="stroke-gray-400 dark:stroke-slate-500"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <circle
                cx="170"
                cy="105"
                r="4"
                fill="none"
                className="stroke-gray-400 dark:stroke-slate-500"
                strokeWidth="2"
              />
              <circle
                cx="170"
                cy="105"
                r="1.5"
                className="fill-gray-400 dark:fill-slate-500"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-slate-50 mb-4 tracking-tight">
          OPS! Página Fora de Rota...
        </h1>
        <p className="text-base md:text-lg text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-10 leading-relaxed px-4">
          Parece que esta página se perdeu nos labirintos do site ou foi
          arquivada incorretamente.
        </p>

        <Link
          to="/login"
          className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 h-14 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/25 dark:shadow-indigo-900/40 hover:shadow-indigo-600/40 transition-all duration-300 font-medium text-[17px] active:scale-95"
        >
          <Home className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
          <span>Voltar para a Segurança </span>
        </Link>
      </div>
    </div>
  );
}
