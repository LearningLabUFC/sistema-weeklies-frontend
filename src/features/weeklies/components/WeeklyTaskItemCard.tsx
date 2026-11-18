import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TaskStatusBadge } from '@/features/tasks/components/TaskStatusBadge';
import { formatDateCivil } from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import type { WeeklyTaskItemResponse } from '@/types/weeklies';

export type HerdadaReviewDecision = 'concluida' | 'nao_concluida' | 'pendente';

interface WeeklyTaskItemCardProps {
  taskItem: WeeklyTaskItemResponse;
  isEditable: boolean;
  canRemoveHerdada: boolean;
  isLastItemInRejeitada: boolean;
  onUpdate: (
    weeklyTaskId: string,
    changes: { concluida?: boolean; impedimento?: string | null },
  ) => Promise<void>;
  onRemove: (weeklyTaskId: string) => Promise<void>;
  onPendingChange?: (weeklyTaskId: string, hasPending: boolean) => void;
  disabled?: boolean;
  sectionMode?: 'retrospectiva' | 'planejamento';
  herdadaReviewDecision?: HerdadaReviewDecision;
  onHerdadaReviewDecision?: (
    weeklyTaskId: string,
    decision: 'concluida' | 'nao_concluida',
  ) => Promise<void> | void;
}

export function WeeklyTaskItemCard({
  taskItem,
  isEditable,
  canRemoveHerdada,
  isLastItemInRejeitada,
  onUpdate,
  onRemove,
  onPendingChange,
  disabled = false,
  sectionMode = 'retrospectiva',
  herdadaReviewDecision,
  onHerdadaReviewDecision,
}: WeeklyTaskItemCardProps) {
  const { showAlertDialog } = useAlertDialog();
  const [isEditingImpediment, setIsEditingImpediment] = useState(
    Boolean(taskItem.impedimento),
  );
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

  const canRemove =
    !isLastItemInRejeitada &&
    ((isEditable && taskItem.origem === 'NOVA') || canRemoveHerdada);

  const handleCheckboxToggle = async (checked: boolean) => {
    if (!isEditable || disabled) return;
    await onUpdate(taskItem.id, { concluida: checked });
  };

  const handleSaveImpediment = async () => {
    if (!isEditable || disabled) return;
    try {
      setIsSavingImpediment(true);
      const text = impedimentText.trim();
      await onUpdate(taskItem.id, {
        impedimento: text.length > 0 ? text : null,
      });
      if (text.length === 0) {
        setIsEditingImpediment(false);
      }
    } finally {
      setIsSavingImpediment(false);
    }
  };

  const handleToggleImpedimentSection = () => {
    if (!isEditable || disabled) return;
    if (isEditingImpediment && !taskItem.impedimento) {
      setIsEditingImpediment(false);
    } else {
      setIsEditingImpediment(true);
    }
  };

  const handleRemoveClick = () => {
    if (!canRemove || disabled) return;

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

  const isPlanningMode = sectionMode === 'planejamento';
  const isHerdadaReviewMode =
    !isPlanningMode &&
    isEditable &&
    taskItem.origem === 'HERDADA' &&
    Boolean(onHerdadaReviewDecision);

  const effectiveHerdadaDecision: HerdadaReviewDecision | undefined =
    taskItem.origem === 'HERDADA'
      ? (herdadaReviewDecision ??
        (taskItem.concluida
          ? 'concluida'
          : taskItem.impedimento
            ? 'nao_concluida'
            : undefined))
      : undefined;

  const canShowImpedimentBlock =
    !isPlanningMode &&
    !taskItem.concluida &&
    (taskItem.origem !== 'HERDADA' ||
      !onHerdadaReviewDecision ||
      effectiveHerdadaDecision === 'nao_concluida' ||
      Boolean(taskItem.impedimento)) &&
    (isEditable || isEditingImpediment);

  const cardColorClass = isPlanningMode
    ? 'border-sky-200 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/20'
    : taskItem.concluida || effectiveHerdadaDecision === 'concluida'
      ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/25'
      : taskItem.origem === 'HERDADA' &&
          (effectiveHerdadaDecision === 'nao_concluida' || !isEditable)
        ? 'border-rose-300 bg-rose-50/60 dark:border-rose-800 dark:bg-rose-950/25'
        : isHerdadaReviewMode && effectiveHerdadaDecision === 'pendente'
          ? 'border-amber-300 bg-amber-50/50 dark:border-amber-800/70 dark:bg-amber-950/20'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900';

  const shouldShowStatusBadge = Boolean(
    taskItem.status_task &&
    (isPlanningMode
      ? taskItem.status_task !== 'PENDENTE'
      : taskItem.concluida
        ? taskItem.status_task !== 'PENDENTE'
        : taskItem.origem === 'HERDADA' || !onHerdadaReviewDecision),
  );

  const shouldShowDeadline = Boolean(
    taskItem.prazo_conclusao &&
    (isPlanningMode ||
      (!taskItem.concluida &&
        (taskItem.origem === 'HERDADA' || !onHerdadaReviewDecision))),
  );

  return (
    <div className={`rounded-xl border p-4 transition-all ${cardColorClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {!isPlanningMode && !isHerdadaReviewMode && (
            <div className="pt-0.5">
              <Checkbox
                id={`task-${taskItem.id}-check`}
                checked={taskItem.concluida}
                disabled={!isEditable || disabled}
                onCheckedChange={checked =>
                  handleCheckboxToggle(checked === true)
                }
                aria-label={`Marcar ${taskItem.titulo} como concluída`}
                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
            </div>
          )}

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {!isPlanningMode && !isHerdadaReviewMode ? (
                <Label
                  htmlFor={`task-${taskItem.id}-check`}
                  className="font-semibold text-sm cursor-pointer leading-tight text-slate-900 dark:text-slate-100"
                >
                  {taskItem.titulo}
                </Label>
              ) : (
                <span className="font-semibold text-sm leading-tight text-slate-900 dark:text-slate-100">
                  {taskItem.titulo}
                </span>
              )}

              <Badge
                variant="outline"
                className={`text-[11px] px-1.5 py-0 font-medium ${
                  taskItem.origem === 'NOVA'
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                }`}
              >
                {taskItem.origem === 'NOVA' ? 'Nova' : 'Herdada'}
              </Badge>

              {isHerdadaReviewMode &&
                effectiveHerdadaDecision === 'pendente' && (
                  <Badge
                    variant="outline"
                    className="text-[11px] px-1.5 py-0 font-medium border-amber-300 bg-amber-100/70 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                  >
                    Revisão pendente
                  </Badge>
                )}

              {shouldShowStatusBadge && (
                <TaskStatusBadge
                  status={taskItem.status_task}
                  className="text-[11px] px-1.5 py-0 h-5"
                />
              )}

              {shouldShowDeadline && taskItem.prazo_conclusao && (
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
        </div>

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveClick}
            disabled={disabled}
            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 -mr-1"
            title="Remover da weekly"
            aria-label="Remover tarefa da weekly"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Revisão obrigatória para tarefas herdadas */}
      {isHerdadaReviewMode && onHerdadaReviewDecision && (
        <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Status da entrega da semana anterior:
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={
                effectiveHerdadaDecision === 'concluida' ? 'default' : 'outline'
              }
              disabled={disabled}
              onClick={() => {
                setIsEditingImpediment(false);
                setImpedimentText('');
                onHerdadaReviewDecision(taskItem.id, 'concluida');
              }}
              className={`h-7 text-xs gap-1.5 ${
                effectiveHerdadaDecision === 'concluida'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                  : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Concluída
            </Button>
            <Button
              type="button"
              size="sm"
              variant={
                effectiveHerdadaDecision === 'nao_concluida'
                  ? 'default'
                  : 'outline'
              }
              disabled={disabled}
              onClick={() =>
                onHerdadaReviewDecision(taskItem.id, 'nao_concluida')
              }
              className={`h-7 text-xs gap-1.5 ${
                effectiveHerdadaDecision === 'nao_concluida'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                  : 'text-rose-700 border-rose-300 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/40'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Não concluída
            </Button>
          </div>
        </div>
      )}

      {/* Seção de impedimento */}
      {canShowImpedimentBlock && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {!isEditingImpediment ? (
            isEditable && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleToggleImpedimentSection}
                disabled={disabled}
                className="text-xs gap-1.5 text-slate-600 hover:text-amber-600 hover:border-amber-300 dark:text-slate-400"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Registrar impedimento
              </Button>
            )
          ) : (
            <div className="space-y-2 bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Impedimento / Bloqueio
                </span>

                {isEditable && (
                  <button
                    type="button"
                    onClick={() => {
                      setImpedimentText('');
                      onUpdate(taskItem.id, { impedimento: null });
                      setIsEditingImpediment(false);
                    }}
                    disabled={disabled}
                    className="text-xs text-slate-400 hover:text-rose-600 underline"
                  >
                    Remover impedimento
                  </button>
                )}
              </div>

              {isEditable ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Explique detalhadamente o motivo que está impedindo ou atrasando esta tarefa..."
                    value={impedimentText}
                    onChange={e => setImpedimentText(e.target.value)}
                    disabled={disabled || isSavingImpediment}
                    className="text-xs bg-white dark:bg-slate-900 min-h-[60px]"
                  />
                  <div className="flex justify-end gap-2">
                    {hasUnsavedImpediment && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setImpedimentText(taskItem.impedimento || '');
                          if (!taskItem.impedimento) {
                            setIsEditingImpediment(false);
                          }
                        }}
                        disabled={disabled || isSavingImpediment}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleSaveImpediment}
                      disabled={
                        disabled ||
                        isSavingImpediment ||
                        impedimentText.trim() === (taskItem.impedimento || '')
                      }
                      className="text-xs gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Salvar impedimento
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-900 dark:text-amber-300 whitespace-pre-wrap">
                  {taskItem.impedimento || 'Nenhuma justificativa detalhada.'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
