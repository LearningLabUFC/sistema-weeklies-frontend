import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Eye,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { WeeklyStatusBadge } from '@/features/weeklies/components/WeeklyStatusBadge';
import {
  formatDateCivil,
  formatTimestampFortaleza,
} from '@/features/weeklies/utils/dateUtils';
import type { WeeklySummaryResponse } from '@/types/weeklies';

export interface WeeklySummaryCardProps {
  weekly: WeeklySummaryResponse;
  sectorName?: string;
  onViewDetails: (weeklyId: string) => void;
}

export const WeeklySummaryCard = ({
  weekly,
  sectorName,
  onViewDetails,
}: WeeklySummaryCardProps) => {
  return (
    <Card className="rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <CardHeader className="bg-slate-50/70 dark:bg-slate-800/40 py-3.5 px-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Semana de {formatDateCivil(weekly.semana_referencia)}</span>
            {sectorName && (
              <span className="text-xs font-normal text-muted-foreground bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {sectorName}
              </span>
            )}
          </div>
          <WeeklyStatusBadge status={weekly.status} />
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Tarefas</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              {weekly.total_tasks}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Concluídas</span>
            </div>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {weekly.total_concluidas}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <AlertCircle
                className={`w-3.5 h-3.5 ${
                  weekly.total_impedimentos > 0
                    ? 'text-amber-500'
                    : 'text-slate-400'
                }`}
              />
              <span>Impedimentos</span>
            </div>
            <span
              className={`text-xl font-bold ${
                weekly.total_impedimentos > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-foreground'
              }`}
            >
              {weekly.total_impedimentos}
            </span>
          </div>
        </div>

        {weekly.status === 'EXPIRADA' && weekly.motivo_expiracao && (
          <div className="mt-3.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Motivo de expiração:</strong> {weekly.motivo_expiracao}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-5 py-3 bg-slate-50/40 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          {weekly.enviada_em ? (
            <span>
              Enviada em: {formatTimestampFortaleza(weekly.enviada_em)}
            </span>
          ) : (
            <span>Criada em: {formatTimestampFortaleza(weekly.criado_em)}</span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-8 px-3 gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400"
          onClick={() => onViewDetails(weekly.id)}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver detalhes</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
