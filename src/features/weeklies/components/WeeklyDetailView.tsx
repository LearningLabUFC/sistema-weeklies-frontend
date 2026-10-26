import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { useCallback, useContext, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { isAdminRole } from '@/config/roles';
import { AuthContext } from '@/features/auth/context/AuthContext';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { AddWeeklyTaskModal } from '@/features/weeklies/components/AddWeeklyTaskModal';
import { EvaluateWeeklyModal } from '@/features/weeklies/components/EvaluateWeeklyModal';
import { WeeklyStatusBadge } from '@/features/weeklies/components/WeeklyStatusBadge';
import { WeeklyTaskItemCard } from '@/features/weeklies/components/WeeklyTaskItemCard';
import {
  dentroDaJanela,
  formatDateCivil,
  formatTimestampFortaleza,
  isRejeitadaWithinGracePeriod,
  obterSemanaReferencia,
} from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import type { WeeklyResponse } from '@/types/weeklies';

export interface WeeklyDetailViewProps {
  weeklyId: string;
  onClose?: () => void;
  onWeeklyUpdated?: (weekly: WeeklyResponse) => void;
  isModal?: boolean;
  isLeaderOrAdmin?: boolean;
  currentUserId?: string;
}

export const WeeklyDetailView = ({
  weeklyId,
  onClose,
  onWeeklyUpdated,
  isModal = false,
  isLeaderOrAdmin = false,
  currentUserId: propUserId,
}: WeeklyDetailViewProps) => {
  const authContext = useContext(AuthContext);
  const currentUserId = propUserId ?? authContext?.user?.id;
  const isLeaderOrAdminEffective =
    isLeaderOrAdmin || isAdminRole(authContext?.user?.global_role);
  const { showAlertDialog } = useAlertDialog();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set());
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  const handlePendingChange = useCallback(
    (weeklyTaskId: string, hasPending: boolean) => {
      setPendingTaskIds(prev => {
        const next = new Set(prev);
        if (hasPending) {
          next.add(weeklyTaskId);
        } else {
          next.delete(weeklyTaskId);
        }
        return next;
      });
    },
    [],
  );

  // W04: Get weekly by ID
  const fetchWeekly = useCallback(async () => {
    return weekliesApi.getById(weeklyId);
  }, [weeklyId]);

  const {
    data: weekly,
    isLoading,
    error,
    refetch,
  } = useAsyncQuery(fetchWeekly);

  // W05: Submit mutation (used for RASCUNHO in window or REJEITADA in grace period)
  const submitMutation = useAsyncMutation(
    async () => {
      if (!weekly) throw new Error('Weekly não carregada');
      return await weekliesApi.submit(weekly.id);
    },
    {
      onSuccess: updated => {
        refetch();
        onWeeklyUpdated?.(updated);
      },
      onError: err => {
        showAlertDialog({
          type: 'error',
          title: 'Erro ao enviar weekly',
          message: err.message,
        });
      },
    },
  );

  // W06: Reopen mutation (for ENVIADA)
  const reopenMutation = useAsyncMutation(
    async () => {
      if (!weekly) throw new Error('Weekly não carregada');
      return await weekliesApi.reopen(weekly.id);
    },
    {
      onSuccess: updated => {
        refetch();
        onWeeklyUpdated?.(updated);
      },
      onError: err => {
        showAlertDialog({
          type: 'error',
          title: 'Erro ao reabrir weekly',
          message: err.message,
        });
      },
    },
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6" data-testid="weekly-detail-loading">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !weekly) {
    return (
      <div className="p-6 text-center space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="w-5 h-5" />
          <AlertTitle>Erro ao carregar detalhes da weekly</AlertTitle>
          <AlertDescription>
            {error?.message || 'Weekly não encontrada ou acesso restrito.'}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Business rules for editing:
  // Valida posse da weekly: apenas o próprio autor pode alterar suas tarefas e reenviar o relatório
  const isOwner = Boolean(
    currentUserId
      ? weekly.usuario_id === currentUserId
      : !isLeaderOrAdminEffective,
  );

  // 1. REJEITADA within 24h grace period
  const isGracePeriodActive =
    weekly.status === 'REJEITADA' &&
    isRejeitadaWithinGracePeriod(weekly.avaliada_em);

  // 2. RASCUNHO in current window
  const isCurrentDraftInWindow =
    weekly.status === 'RASCUNHO' &&
    weekly.semana_referencia === obterSemanaReferencia() &&
    dentroDaJanela();

  // Apenas o próprio proprietário pode editar tarefas ou submeter alterações
  const isEditable = isOwner && (isGracePeriodActive || isCurrentDraftInWindow);

  // Apenas o próprio proprietário pode reabrir uma weekly ENVIADA dentro da janela
  const canReopen = isOwner && weekly.status === 'ENVIADA' && dentroDaJanela();

  // Líder do setor ou admin pode gerenciar/desvincular tarefas em relatórios rascunho ou rejeitados
  const canLeaderRemoveTasks =
    Boolean(isLeaderOrAdminEffective) &&
    (weekly.status === 'RASCUNHO' || weekly.status === 'REJEITADA');

  const hasPendingTaskChanges = pendingTaskIds.size > 0 || isUpdatingTask;

  // W10: Update item
  const handleUpdateTask = async (
    weeklyTaskId: string,
    changes: { concluida?: boolean; impedimento?: string | null },
  ) => {
    try {
      setIsUpdatingTask(true);
      await weekliesApi.updateTask(weekly.id, weeklyTaskId, changes);
      const updated = await refetch();
      if (updated) onWeeklyUpdated?.(updated);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Falha ao atualizar tarefa';
      showAlertDialog({
        type: 'error',
        title: 'Erro ao atualizar tarefa',
        message: msg,
      });
      throw err;
    } finally {
      setIsUpdatingTask(false);
    }
  };

  // W11: Remove item
  const handleRemoveTask = async (weeklyTaskId: string) => {
    try {
      await weekliesApi.removeTask(weekly.id, weeklyTaskId);
      const updated = await refetch();
      if (updated) onWeeklyUpdated?.(updated);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Falha ao desvincular tarefa';
      showAlertDialog({
        type: 'error',
        title: 'Erro ao desvincular tarefa',
        message: msg,
      });
      throw err;
    }
  };

  return (
    <div
      className={`space-y-6 ${isModal ? '' : 'max-w-4xl mx-auto py-6 px-4 sm:px-6'}`}
      data-testid="weekly-detail-view"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Semana de {formatDateCivil(weekly.semana_referencia)}
            </h2>
            <WeeklyStatusBadge status={weekly.status} />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {weekly.membro_nome
              ? `Membro: ${weekly.membro_nome}`
              : `ID do setor: ${weekly.setor_id}`}
          </p>
        </div>

        {onClose && !isModal && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
            aria-label="Fechar detalhe"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Expiration Details for EXPIRADA */}
      {weekly.status === 'EXPIRADA' && (
        <Alert
          variant="destructive"
          className="border-red-300 dark:border-red-900 bg-red-50/90 dark:bg-red-950/30"
        >
          <AlertCircle className="w-5 h-5" />
          <AlertTitle className="font-bold">Weekly Expirada</AlertTitle>
          <AlertDescription className="space-y-1 mt-1 text-sm">
            {weekly.motivo_expiracao && (
              <p>
                <strong>Motivo:</strong> {weekly.motivo_expiracao}
              </p>
            )}
            {weekly.detalhe_expiracao && (
              <p>
                <strong>Detalhe:</strong> {weekly.detalhe_expiracao}
              </p>
            )}
            {weekly.atualizado_em && (
              <p className="text-xs opacity-80">
                Expirada em: {formatTimestampFortaleza(weekly.atualizado_em)}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Leader Feedback Banner (observacao_lider) */}
      {weekly.observacao_lider && (
        <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30">
          <CardHeader className="py-3 px-4 flex flex-row items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-300">
              Feedback da Liderança
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 text-sm text-amber-950 dark:text-amber-200">
            <p className="whitespace-pre-wrap">{weekly.observacao_lider}</p>
            {weekly.avaliada_em && (
              <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-2">
                Avaliada em: {formatTimestampFortaleza(weekly.avaliada_em)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grace Period Notification for REJEITADA */}
      {weekly.status === 'REJEITADA' && (
        <>
          {isOwner ? (
            isGracePeriodActive ? (
              <Alert className="border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-900 dark:text-amber-300 font-bold">
                  Carência de 24 horas ativa para correção
                </AlertTitle>
                <AlertDescription className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                  Esta weekly foi rejeitada. Você pode corrigir as tarefas,
                  atualizar impedimentos ou adicionar novos itens e reenviar o
                  relatório durante o prazo de carência.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="w-5 h-5" />
                <AlertTitle className="font-bold">
                  Prazo de carência encerrado
                </AlertTitle>
                <AlertDescription className="text-sm">
                  O prazo de 24 horas para correção após a rejeição expirou.
                  Esta weekly não aceita mais alterações.
                </AlertDescription>
              </Alert>
            )
          ) : isGracePeriodActive ? (
            <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-900 dark:text-amber-300 font-semibold">
                Aguardando correção do membro
              </AlertTitle>
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                Esta weekly foi rejeitada e está no prazo de carência de 24
                horas. O membro ({weekly.membro_nome || 'autor'}) pode corrigir
                as tarefas e reenviar o relatório para nova avaliação.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="w-5 h-5" />
              <AlertTitle className="font-bold">
                Prazo de carência encerrado
              </AlertTitle>
              <AlertDescription className="text-sm">
                O prazo de 24 horas para o membro reenviar a correção expirou.
                Esta weekly não aceita mais alterações.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Metadata Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-muted-foreground block">Criada em:</span>
          <span className="font-medium text-foreground">
            {formatTimestampFortaleza(weekly.criado_em)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Enviada em:</span>
          <span className="font-medium text-foreground">
            {formatTimestampFortaleza(weekly.enviada_em)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">Avaliada em:</span>
          <span className="font-medium text-foreground">
            {formatTimestampFortaleza(weekly.avaliada_em)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block">
            Última atualização:
          </span>
          <span className="font-medium text-foreground">
            {formatTimestampFortaleza(weekly.atualizado_em)}
          </span>
        </div>
      </div>

      {/* Action Header / Add Task */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          <span>Tarefas da Weekly ({weekly.tasks.length})</span>
        </h3>

        {isEditable && (
          <Button
            size="sm"
            onClick={() => setIsAddTaskModalOpen(true)}
            className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Tarefa</span>
          </Button>
        )}
      </div>

      {/* Tasks List */}
      {weekly.tasks.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-2xl p-6 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="font-medium">Nenhuma tarefa associada a esta weekly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {weekly.tasks.map(taskItem => (
            <WeeklyTaskItemCard
              key={taskItem.id}
              taskItem={taskItem}
              isEditable={isEditable}
              canRemoveHerdada={canLeaderRemoveTasks}
              isLastItemInRejeitada={
                weekly.status === 'REJEITADA' && weekly.tasks.length <= 1
              }
              onUpdate={handleUpdateTask}
              onRemove={handleRemoveTask}
              onPendingChange={handlePendingChange}
              disabled={submitMutation.isMutating || reopenMutation.isMutating}
            />
          ))}
        </div>
      )}

      {/* Bottom Action Footer */}
      {(isEditable ||
        canReopen ||
        (isLeaderOrAdminEffective && weekly.status === 'ENVIADA') ||
        (isModal && onClose)) && (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t dark:border-slate-800">
          {onClose && !isEditable && (
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              Fechar
            </Button>
          )}

          {isLeaderOrAdminEffective && weekly.status === 'ENVIADA' && (
            <Button
              onClick={() => setIsEvaluateModalOpen(true)}
              disabled={Boolean(
                currentUserId && weekly.usuario_id === currentUserId,
              )}
              title={
                currentUserId && weekly.usuario_id === currentUserId
                  ? 'Você não pode avaliar seu próprio relatório semanal'
                  : undefined
              }
              className="gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Avaliar Weekly</span>
            </Button>
          )}

          {canReopen && (
            <Button
              variant="outline"
              onClick={() => reopenMutation.execute()}
              disabled={reopenMutation.isMutating}
              className="gap-1.5 rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40"
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {reopenMutation.isMutating ? 'Reabrindo...' : 'Reabrir Weekly'}
              </span>
            </Button>
          )}

          {isEditable && (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              {hasPendingTaskChanges && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Salve as alterações pendentes antes de enviar
                </span>
              )}
              <Button
                onClick={() => {
                  if (hasPendingTaskChanges) {
                    showAlertDialog({
                      type: 'warning',
                      title: 'Alterações pendentes',
                      message:
                        'Salve as alterações pendentes nas tarefas antes de enviar o relatório.',
                    });
                    return;
                  }
                  submitMutation.execute();
                }}
                disabled={
                  submitMutation.isMutating ||
                  weekly.tasks.length === 0 ||
                  hasPendingTaskChanges
                }
                className="gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {weekly.status === 'REJEITADA' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {submitMutation.isMutating
                        ? 'Reenviando...'
                        : 'Reenviar Weekly Corrigida'}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      {submitMutation.isMutating
                        ? 'Enviando...'
                        : 'Enviar Weekly'}
                    </span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal W09 for adding inline task or linking existing */}
      {isAddTaskModalOpen && (
        <AddWeeklyTaskModal
          isOpen={isAddTaskModalOpen}
          weeklyId={weekly.id}
          sectorId={weekly.setor_id}
          existingTaskIds={weekly.tasks.map(t => t.task_id)}
          onClose={() => setIsAddTaskModalOpen(false)}
          onSuccess={async () => {
            setIsAddTaskModalOpen(false);
            const updated = await refetch();
            if (updated) onWeeklyUpdated?.(updated);
          }}
        />
      )}

      {/* Modal W08 for evaluating weekly */}
      {isEvaluateModalOpen && (
        <EvaluateWeeklyModal
          isOpen={isEvaluateModalOpen}
          weeklyId={weekly.id}
          semanaReferencia={weekly.semana_referencia}
          membroNome={weekly.membro_nome}
          membroId={weekly.usuario_id}
          currentUserId={currentUserId}
          onClose={() => setIsEvaluateModalOpen(false)}
          onSuccess={async updatedWeekly => {
            setIsEvaluateModalOpen(false);
            const refetched = await refetch();
            if (updatedWeekly) {
              onWeeklyUpdated?.(updatedWeekly);
            } else if (refetched) {
              onWeeklyUpdated?.(refetched);
            }
          }}
        />
      )}
    </div>
  );
};
