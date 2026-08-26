import { Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface StatusCardProps {
  isPresenceActive: boolean;
}

const StatusCard = ({ isPresenceActive }: StatusCardProps) => {
  return (
    <Card
      className={`rounded-2xl shadow-sm border overflow-hidden transition-colors ${
        isPresenceActive
          ? 'border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10'
          : 'border-transparent dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
    >
      <CardContent className="p-5 sm:p-6 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-center shrink-0 ${
              isPresenceActive
                ? 'bg-green-100/80 dark:bg-green-900/30'
                : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <Clock
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isPresenceActive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            />
          </div>
          <div className="flex flex-col">
            <span
              className={`text-xs sm:text-sm font-medium ${
                isPresenceActive
                  ? 'text-green-800 dark:text-green-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Status da presença
            </span>
            <span
              className={`text-base sm:text-lg font-semibold ${
                isPresenceActive
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {isPresenceActive
                ? 'Ativa — você pode marcar presença'
                : 'Encerrada'}
            </span>
          </div>
        </div>

        <Badge
          variant="secondary"
          className={`pointer-events-none text-xs sm:text-sm px-3 py-1 font-medium shrink-0 border-transparent shadow-none ${
            isPresenceActive
              ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/30'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          {isPresenceActive ? 'Ativa' : 'Encerrada'}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
