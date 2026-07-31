import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface EngagementSummaryCardProps {
  presenceRate: number;
  submissionRate: number;
}

export function EngagementSummaryCard({
  presenceRate,
  submissionRate,
}: EngagementSummaryCardProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-linear-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 shadow-sm">
      <CardHeader className="p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-md">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Resumo de Engajamento
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-500 dark:text-slate-400">
              Assiduidade em Encontros
            </span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              {presenceRate}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${presenceRate}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-500 dark:text-slate-400">
              Envios de Weeklies (Esta Semana)
            </span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              {submissionRate}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${submissionRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
