import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import type { StatCardProps } from '@/types/dashboard';

interface StatsGridProps {
  stats: StatCardProps[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <Link
            key={stat.label}
            to={stat.to}
            className="group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-xl transition-all"
          >
            <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-indigo-500/50 dark:hover:border-indigo-400/50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div
                    className={`p-2.5 rounded-xl border ${stat.color} transition-transform group-hover:scale-105`}
                  >
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
