import { AlertCircle, Calendar, CheckCircle2, Send } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { formatDateCivil } from '@/features/weeklies/utils/dateUtils';
import type { WeeklyTaskItemResponse } from '@/types/weeklies';

interface WeeklyReviewSummarySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit?: () => void;
  isSubmitting?: boolean;
  semanaReferencia: string;
  retrospectiveTasks: WeeklyTaskItemResponse[];
  uncompletedRetrospectiveTasks: WeeklyTaskItemResponse[];
  plannedTasks: WeeklyTaskItemResponse[];
  isRejeitada?: boolean;
  readOnly?: boolean;
}

/**
 * Sheet lateral com resumo estruturado da weekly exibido antes de confirmar o envio
 * ou em modo somente leitura após o envio.
 */
export function WeeklyReviewSummarySheet({
  isOpen,
  onClose,
  onConfirmSubmit,
  isSubmitting = false,
  semanaReferencia,
  retrospectiveTasks,
  uncompletedRetrospectiveTasks,
  plannedTasks,
  isRejeitada = false,
  readOnly = false,
}: WeeklyReviewSummarySheetProps) {
  const completedRetrospective = retrospectiveTasks.filter(t => t.concluida);

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0"
      >
        <SheetHeader className="border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <SheetTitle className="text-lg font-bold">
            Resumo da Weekly — {formatDateCivil(semanaReferencia)}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {readOnly
              ? 'Visualização consolidada das entregas da semana anterior e do planejamento para esta semana.'
              : 'Confira as entregas da semana anterior e o planejamento desta semana antes de confirmar o envio.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Bloco 1: O que fiz na semana anterior */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                O que fiz na semana anterior
              </h4>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {completedRetrospective.length}{' '}
                {completedRetrospective.length === 1
                  ? 'item entregue'
                  : 'itens entregues'}
              </span>
            </div>

            {completedRetrospective.length === 0 ? (
              <p className="text-xs text-slate-500 border border-dashed rounded-lg p-3 text-center">
                Nenhuma entrega concluída da semana anterior registrada.
              </p>
            ) : (
              <div className="space-y-2">
                {completedRetrospective.map(task => (
                  <div
                    key={`summary-done-${task.id}`}
                    className="rounded-lg border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20 p-3 flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                        {task.titulo}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-emerald-300 bg-emerald-100/70 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0"
                    >
                      Concluída
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bloco 2: O que farei nesta semana? */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                O que farei nesta semana?
              </h4>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {uncompletedRetrospectiveTasks.length + plannedTasks.length}{' '}
                {uncompletedRetrospectiveTasks.length + plannedTasks.length ===
                1
                  ? 'tarefa'
                  : 'tarefas'}
              </span>
            </div>

            {uncompletedRetrospectiveTasks.length === 0 &&
            plannedTasks.length === 0 ? (
              <p className="text-xs text-slate-500 border border-dashed rounded-lg p-3 text-center">
                Nenhuma tarefa planejada para esta semana.
              </p>
            ) : (
              <div className="space-y-2">
                {uncompletedRetrospectiveTasks.map(task => (
                  <div
                    key={`summary-next-carried-${task.id}`}
                    className="rounded-lg border border-sky-200 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/20 p-3 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-xs font-medium text-slate-900 dark:text-slate-100 block">
                          {`↪ ${task.titulo}`}
                        </span>
                        {task.prazo_conclusao && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Calendar className="w-3 h-3" />
                            Prazo: {formatDateCivil(task.prazo_conclusao)}
                          </span>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-sky-300 bg-sky-100/70 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300 shrink-0"
                      >
                        Não concluída — continuação
                      </Badge>
                    </div>

                    {task.impedimento && (
                      <div className="flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-white/70 dark:bg-slate-900/60 px-2 py-1 rounded">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span>Impedimento: {task.impedimento}</span>
                      </div>
                    )}
                  </div>
                ))}

                {plannedTasks.map(task => (
                  <div
                    key={`summary-next-new-${task.id}`}
                    className="rounded-lg border border-sky-200 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/20 p-3 flex items-start justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 block">
                        {task.titulo}
                      </span>
                      {task.prazo_conclusao && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3" />
                          Prazo: {formatDateCivil(task.prazo_conclusao)}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 shrink-0"
                    >
                      Nova
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <SheetFooter className="border-t border-slate-200 dark:border-slate-800 px-5 py-4 flex-row justify-end gap-2">
          {readOnly ? (
            <Button type="button" variant="outline" onClick={onClose}>
              Fechar
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Voltar e editar
              </Button>
              <Button
                type="button"
                onClick={onConfirmSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isRejeitada
                  ? 'Confirmar e Reenviar Weekly'
                  : 'Confirmar e Enviar Weekly'}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
