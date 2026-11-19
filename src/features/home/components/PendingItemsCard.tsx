import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Mail,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { assignmentsApi } from '@/features/weeklies/api/assignmentsApi';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { warningsApi } from '@/features/weeklies/api/warningsApi';
import { isPrazoVencido } from '@/features/weeklies/utils/dateUtils';
import { cn } from '@/lib/utils';

export interface PendingItemsCardProps {
  className?: string;
  horizontal?: boolean;
}

export function PendingItemsCard({
  className,
  horizontal = false,
}: PendingItemsCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [totalWarnings, setTotalWarnings] = useState(0);
  const [pendingInvites, setPendingInvites] = useState(0);
  const [totalPendingTasks, setTotalPendingTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const loadPendingItems = async () => {
      setIsLoading(true);
      const [warningsRes, invitesRes, tasksRes] = await Promise.allSettled([
        warningsApi.getMyWarnings({ pagina: 1, limite: 5 }),
        assignmentsApi.getMyAssignments({
          tipo: 'recebidas',
          status: 'PENDENTE',
          pagina: 1,
          limite: 5,
        }),
        tasksApi.getMyTasks({ status: 'PENDENTE', pagina: 1, limite: 50 }),
      ]);

      if (isCancelled) return;

      if (warningsRes.status === 'fulfilled') {
        setTotalWarnings(warningsRes.value.total ?? 0);
      }
      if (invitesRes.status === 'fulfilled') {
        setPendingInvites(invitesRes.value.total ?? 0);
      }
      if (tasksRes.status === 'fulfilled') {
        const tasks = tasksRes.value.tasks ?? [];
        setTotalPendingTasks(tasksRes.value.total ?? tasks.length);
        setOverdueTasks(
          tasks.filter(t => isPrazoVencido(t.prazo_conclusao)).length,
        );
      }

      setIsLoading(false);
    };

    void loadPendingItems();

    return () => {
      isCancelled = true;
    };
  }, []);

  const hasAnyAlert =
    totalWarnings > 0 || pendingInvites > 0 || overdueTasks > 0;

  return (
    <Card
      className={cn(
        'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm',
        className,
      )}
    >
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Pendências e Alertas
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Itens que pedem sua atenção
            </p>
          </div>
        </div>

        {!isLoading && (
          <Badge
            variant="outline"
            className={
              hasAnyAlert
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
            }
          >
            {hasAnyAlert ? 'Atenção' : 'Tudo em dia'}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-5">
        {isLoading ? (
          <div
            className={cn(
              'grid gap-3',
              horizontal ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1',
            )}
          >
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-3',
              horizontal ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1',
            )}
          >
            {/* Advertências */}
            <Link
              to="/weeklies"
              className={cn(
                'group flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors',
                totalWarnings > 0
                  ? 'border-rose-200 bg-rose-50/60 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/20'
                  : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-800/30',
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {totalWarnings > 0 ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Advertências
                  </p>
                  <p
                    className={cn(
                      'text-xs truncate',
                      totalWarnings > 0
                        ? 'text-rose-700 dark:text-rose-300 font-medium'
                        : 'text-slate-500 dark:text-slate-400',
                    )}
                  >
                    {totalWarnings > 0
                      ? `${totalWarnings} ${totalWarnings === 1 ? 'advertência registrada' : 'advertências registradas'}`
                      : 'Nenhuma advertência ativa'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            {/* Convites de colaboração */}
            <Link
              to="/weeklies/tarefas"
              className={cn(
                'group flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors',
                pendingInvites > 0
                  ? 'border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/20'
                  : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-800/30',
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Mail
                  className={cn(
                    'w-4 h-4 shrink-0',
                    pendingInvites > 0
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400',
                  )}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Convites de colaboração
                  </p>
                  <p
                    className={cn(
                      'text-xs truncate',
                      pendingInvites > 0
                        ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'text-slate-500 dark:text-slate-400',
                    )}
                  >
                    {pendingInvites > 0
                      ? `${pendingInvites} ${pendingInvites === 1 ? 'convite aguardando resposta' : 'convites aguardando resposta'}`
                      : 'Nenhum convite pendente'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            {/* Prazos de tarefas */}
            <Link
              to="/weeklies/tarefas"
              className={cn(
                'group flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors',
                overdueTasks > 0
                  ? 'border-amber-200 bg-amber-50/60 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20'
                  : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-800/30',
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <CalendarClock
                  className={cn(
                    'w-4 h-4 shrink-0',
                    overdueTasks > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-400',
                  )}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Tarefas e prazos
                  </p>
                  <p
                    className={cn(
                      'text-xs truncate',
                      overdueTasks > 0
                        ? 'text-amber-700 dark:text-amber-300 font-medium'
                        : 'text-slate-500 dark:text-slate-400',
                    )}
                  >
                    {overdueTasks > 0
                      ? `${overdueTasks} ${overdueTasks === 1 ? 'tarefa com prazo vencido' : 'tarefas com prazo vencido'}`
                      : totalPendingTasks > 0
                        ? `${totalPendingTasks} ${totalPendingTasks === 1 ? 'tarefa pendente no prazo' : 'tarefas pendentes no prazo'}`
                        : 'Nenhuma tarefa pendente'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
