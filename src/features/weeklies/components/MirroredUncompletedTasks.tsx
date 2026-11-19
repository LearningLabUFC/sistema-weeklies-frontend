import { AlertCircle, Calendar, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDateCivil } from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import type { WeeklyTaskItemResponse } from '@/types/weeklies';

interface MirroredUncompletedTasksProps {
  tasks: WeeklyTaskItemResponse[];
  isEditable?: boolean;
  disabled?: boolean;
  canRemoveHerdada?: boolean;
  onUpdate?: (
    weeklyTaskId: string,
    changes: { concluida?: boolean; impedimento?: string | null },
  ) => Promise<void>;
  onRemove?: (weeklyTaskId: string) => Promise<void>;
  onHerdadaReviewDecision?: (
    weeklyTaskId: string,
    decision: 'concluida' | 'nao_concluida',
  ) => void;
  onPendingChange?: (weeklyTaskId: string, hasPending: boolean) => void;
}

interface ContinuationTaskItemProps {
  taskItem: WeeklyTaskItemResponse;
  isEditable?: boolean;
  disabled?: boolean;
  canRemove?: boolean;
  onUpdate?: (
    weeklyTaskId: string,
    changes: { concluida?: boolean; impedimento?: string | null },
  ) => Promise<void>;
  onRemove?: (weeklyTaskId: string) => Promise<void>;
  onHerdadaReviewDecision?: (
    weeklyTaskId: string,
    decision: 'concluida' | 'nao_concluida',
  ) => void;
  onPendingChange?: (weeklyTaskId: string, hasPending: boolean) => void;
}

function ContinuationTaskItem({
  taskItem,
  isEditable = false,
  disabled = false,
  canRemove = false,
  onUpdate,
  onRemove,
  onHerdadaReviewDecision,
  onPendingChange,
}: ContinuationTaskItemProps) {
  const { showAlertDialog } = useAlertDialog();
  const [isEditingImpediment, setIsEditingImpediment] = useState(false);
  const [impedimentText, setImpedimentText] = useState(
    taskItem.impedimento || '',
  );
  const [isSavingImpediment, setIsSavingImpediment] = useState(false);

  const hasUnsavedImpediment =
    isEditingImpediment &&
    impedimentText.trim() !== (taskItem.impedimento || '');
  const hasPendingChanges = hasUnsavedImpediment || isSavingImpediment;

  useEffect(() => {
    onPendingChange?.(taskItem.id, hasPendingChanges);
    return () => {
      onPendingChange?.(taskItem.id, false);
    };
  }, [taskItem.id, hasPendingChanges, onPendingChange]);

  const handleRevertToCompleted = async () => {
    if (!isEditable || disabled || !onHerdadaReviewDecision) return;
    onHerdadaReviewDecision(taskItem.id, 'concluida');
    if (onUpdate) {
      await onUpdate(taskItem.id, { concluida: true, impedimento: null });
    }
  };

  const handleSaveImpediment = async () => {
    if (!isEditable || disabled || !onUpdate) return;
    try {
      setIsSavingImpediment(true);
      const text = impedimentText.trim();
      await onUpdate(taskItem.id, {
        impedimento: text.length > 0 ? text : null,
      });
      setIsEditingImpediment(false);
    } finally {
      setIsSavingImpediment(false);
    }
  };

  const handleRemoveImpediment = async () => {
    if (!isEditable || disabled || !onUpdate) return;
    try {
      setIsSavingImpediment(true);
      setImpedimentText('');
      await onUpdate(taskItem.id, { impedimento: null });
      setIsEditingImpediment(false);
    } finally {
      setIsSavingImpediment(false);
    }
  };

  const handleRemoveClick = () => {
    if (!canRemove || disabled || !onRemove) return;

    showAlertDialog({
      type: 'confirm',
      title: 'Remover tarefa da weekly',
      message: `Deseja desvincular a tarefa "${taskItem.titulo}" desta weekly? A tarefa não será excluída do sistema, apenas desvinculada deste relatório.`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        await onRemove(taskItem.id);
      },
    });
  };

  return (
    <div
      data-testid="uncompleted-mirrored-task"
      className="rounded-xl border border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/30 p-3.5 space-y-3 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sky-600 dark:text-sky-400 font-semibold select-none">
              ↪{' '}
            </span>
            <span className="font-semibold text-sm leading-tight text-slate-900 dark:text-slate-100">
              {taskItem.titulo}
            </span>

            <Badge
              variant="outline"
              className="text-[11px] px-1.5 py-0 font-medium border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
            >
              Herdada
            </Badge>

            {taskItem.prazo_conclusao && (
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="w-3 h-3 text-slate-400" />
                Prazo: {formatDateCivil(taskItem.prazo_conclusao)}
              </span>
            )}
          </div>

          {taskItem.descricao && (
            <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {taskItem.descricao}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start shrink-0">
          {/* Reversibilidade: Botão para mover de volta para "O que fiz na semana anterior" */}
          {isEditable && onHerdadaReviewDecision && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={handleRevertToCompleted}
              className="text-xs h-7 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              title="Concluiu na semana anterior? Mover de volta para 'O que fiz' como concluída"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Concluída</span>
            </Button>
          )}

          {canRemove && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveClick}
              disabled={disabled}
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 h-7 w-7"
              title="Remover da weekly"
              aria-label="Remover tarefa da weekly"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Seção de impedimento */}
      <div className="pt-2 border-t border-sky-200/60 dark:border-sky-900/50">
        {!isEditingImpediment ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            {taskItem.impedimento ? (
              <div className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/50 flex-1 min-w-0">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Impedimento registrado:
                  </span>
                  <p className="whitespace-pre-wrap">{taskItem.impedimento}</p>
                </div>
              </div>
            ) : (
              isEditable && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingImpediment(true)}
                  disabled={disabled}
                  className="text-xs h-7 gap-1.5 text-slate-600 hover:text-amber-700 hover:border-amber-300 dark:text-slate-400"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Registrar impedimento
                </Button>
              )
            )}

            {isEditable && taskItem.impedimento && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => setIsEditingImpediment(true)}
                  className="text-xs h-7 text-amber-700 hover:bg-amber-100/50 dark:text-amber-400"
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={handleRemoveImpediment}
                  className="text-xs h-7 text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                >
                  Remover
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 bg-amber-50/50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200/80 dark:border-amber-900/60">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Justificativa / Impedimento da Semana Anterior
              </span>
            </div>

            <Textarea
              value={impedimentText}
              onChange={e => setImpedimentText(e.target.value)}
              placeholder="Explique detalhadamente o motivo do impedimento..."
              rows={2}
              maxLength={500}
              disabled={disabled || isSavingImpediment}
              className="text-xs resize-none bg-white dark:bg-slate-900"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {impedimentText.length}/500 caracteres
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setImpedimentText(taskItem.impedimento || '');
                    setIsEditingImpediment(false);
                  }}
                  disabled={disabled || isSavingImpediment}
                  className="text-xs h-7"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveImpediment}
                  disabled={disabled || isSavingImpediment}
                  className="text-xs h-7 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isSavingImpediment ? 'Salvando...' : 'Salvar impedimento'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Bloco da Seção 2 que exibe as tarefas do ciclo anterior não concluídas
 * que foram transferidas para continuar neste ciclo.
 */
export function MirroredUncompletedTasks({
  tasks,
  isEditable = false,
  disabled = false,
  canRemoveHerdada = false,
  onUpdate,
  onRemove,
  onHerdadaReviewDecision,
  onPendingChange,
}: MirroredUncompletedTasksProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-sky-200/90 bg-sky-50/40 dark:border-sky-900/50 dark:bg-sky-950/15 p-3.5 sm:p-4 space-y-3">
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
        Tarefas da semana anterior que não foram concluídas e continuam no
        planejamento deste ciclo.
      </p>

      <div className="space-y-2.5">
        {tasks.map(taskItem => (
          <ContinuationTaskItem
            key={`continuation-${taskItem.id}`}
            taskItem={taskItem}
            isEditable={isEditable}
            disabled={disabled}
            canRemove={canRemoveHerdada}
            onUpdate={onUpdate}
            onRemove={onRemove}
            onHerdadaReviewDecision={onHerdadaReviewDecision}
            onPendingChange={onPendingChange}
          />
        ))}
      </div>
    </div>
  );
}
