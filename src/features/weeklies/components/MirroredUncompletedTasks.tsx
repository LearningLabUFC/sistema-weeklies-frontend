import { AlertCircle, Calendar, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { formatDateCivil } from '@/features/weeklies/utils/dateUtils';
import type { WeeklyTaskItemResponse } from '@/types/weeklies';

interface MirroredUncompletedTasksProps {
  tasks: WeeklyTaskItemResponse[];
}

/**
 * Sub-bloco reativo da Seção 2 que espelha automaticamente (somente leitura)
 * as tarefas da Seção 1 que ainda não foram marcadas como concluídas.
 */
export function MirroredUncompletedTasks({
  tasks,
}: MirroredUncompletedTasksProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-sky-200/80 bg-sky-50/40 dark:border-sky-900/50 dark:bg-sky-950/15 p-3.5 sm:p-4 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h4 className="text-xs sm:text-sm font-semibold text-sky-950 dark:text-sky-200">
            Tarefas não concluídas
          </h4>
        </div>
        <span className="text-[11px] font-medium text-sky-800 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-900/40 px-2 py-0.5 rounded-full">
          {tasks.length}{' '}
          {tasks.length === 1
            ? 'continua pendente para esta semana'
            : 'continuam pendentes para esta semana'}
        </span>
      </div>

      <p className="text-[11px] text-sky-800/80 dark:text-sky-300/80">
        Espelhamento automático das tarefas da semana anterior que ainda não
        foram marcadas como concluídas.
      </p>

      <div className="space-y-2">
        {tasks.map(taskItem => (
          <div
            key={`mirrored-${taskItem.id}`}
            data-testid="uncompleted-mirrored-task"
            className="rounded-lg border border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/30 px-3 py-2.5 space-y-1.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                {`↪ ${taskItem.titulo}`}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[11px] px-1.5 py-0 font-medium border-sky-300 bg-sky-100/70 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                >
                  Não concluída
                </Badge>

                {taskItem.prazo_conclusao && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Prazo: {formatDateCivil(taskItem.prazo_conclusao)}
                  </span>
                )}
              </div>
            </div>

            {taskItem.impedimento && (
              <div className="flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 px-2 py-1 rounded">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>Impedimento: {taskItem.impedimento}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
