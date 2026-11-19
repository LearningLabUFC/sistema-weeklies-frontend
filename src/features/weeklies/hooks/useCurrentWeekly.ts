import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isAdminRole } from '@/config/roles';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { isRejeitadaWithinGracePeriod } from '@/features/weeklies/utils/dateUtils';
import {
  getHerdadaReviewDecision,
  type HerdadaDecisionMap,
  partitionWeeklyTasks,
} from '@/features/weeklies/utils/weeklyTaskSections';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import { useAuth } from '@/hooks/useAuth';
import { parseApiError } from '@/lib/errorHandler';
import type { SectorDetail } from '@/types/sectors';
import type { WeeklyResponse } from '@/types/weeklies';

export interface UseCurrentWeeklyOptions {
  selectedSectorId: string | null;
  enabled: boolean;
}

/**
 * Hook que gerencia o ciclo de vida completo da weekly da semana atual para o setor selecionado,
 * com proteção contra race conditions em trocas rápidas de setor.
 */
export function useCurrentWeekly({
  selectedSectorId,
  enabled,
}: UseCurrentWeeklyOptions) {
  const { user } = useAuth();
  const { showAlertDialog } = useAlertDialog();

  const [weekly, setWeekly] = useState<WeeklyResponse | null>(null);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(
    Boolean(selectedSectorId && enabled),
  );
  const [weeklyNotFoundError, setWeeklyNotFoundError] = useState(false);
  const [addTaskModalMode, setAddTaskModalMode] = useState<
    'retrospectiva' | 'planejamento' | null
  >(null);
  const [herdadaDecisions, setHerdadaDecisions] = useState<HerdadaDecisionMap>(
    {},
  );
  const [isReviewSheetOpen, setIsReviewSheetOpen] = useState(false);
  const [activeMutationsCount, setActiveMutationsCount] = useState(0);
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set());
  const [sectorDetail, setSectorDetail] = useState<SectorDetail | null>(null);
  const [weeklyRefreshTrigger, setWeeklyRefreshTrigger] = useState(0);

  const isMounted = useRef(true);
  const selectedSectorIdRef = useRef(selectedSectorId);
  useEffect(() => {
    selectedSectorIdRef.current = selectedSectorId;
  }, [selectedSectorId]);

  // Reset síncrono durante a renderização ao trocar de setor
  const [prevSectorId, setPrevSectorId] = useState(selectedSectorId);
  if (prevSectorId !== selectedSectorId) {
    setPrevSectorId(selectedSectorId);
    setWeekly(null);
    setAddTaskModalMode(null);
    setHerdadaDecisions({});
    setIsReviewSheetOpen(false);
    setWeeklyNotFoundError(false);
    setIsLoadingWeekly(Boolean(selectedSectorId && enabled));
  }

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedSectorId || !enabled) return;

    let isCancelled = false;
    sectorsApi
      .getById(selectedSectorId)
      .then(detail => {
        if (!isCancelled && selectedSectorIdRef.current === selectedSectorId) {
          setSectorDetail(detail);
        }
      })
      .catch(() => {
        if (!isCancelled && selectedSectorIdRef.current === selectedSectorId) {
          setSectorDetail(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedSectorId, enabled]);

  const isSectorLeader = Boolean(
    sectorDetail?.membros?.some(m => m.id === user?.id && m.papel === 'lider'),
  );
  const isAdmin = isAdminRole(user?.global_role);
  const canRemoveHerdada = isAdmin || isSectorLeader;

  const refreshCurrentWeekly = useCallback(() => {
    if (!isMounted.current) return;
    setIsLoadingWeekly(true);
    setWeeklyRefreshTrigger(t => t + 1);
  }, []);

  useEffect(() => {
    if (!selectedSectorId || !enabled) {
      return;
    }

    const currentSector = selectedSectorId;
    let isCancelled = false;
    weekliesApi
      .getCurrentWeekly(currentSector)
      .then(data => {
        if (isCancelled || selectedSectorIdRef.current !== currentSector)
          return;
        setWeekly(data);
        setWeeklyNotFoundError(false);
        setIsLoadingWeekly(false);
      })
      .catch((err: unknown) => {
        if (isCancelled || selectedSectorIdRef.current !== currentSector)
          return;
        const parsed = parseApiError(err);
        if (parsed.isNotFound) {
          setWeekly(null);
          setWeeklyNotFoundError(true);
        } else {
          setWeekly(null);
          showAlertDialog({
            type: 'error',
            title: 'Erro ao carregar weekly',
            message: parsed.message,
          });
        }
        setIsLoadingWeekly(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedSectorId, enabled, weeklyRefreshTrigger, showAlertDialog]);

  // Garante de forma estrita que nenhuma visualização ou ação acesse uma weekly
  // pertencente a um setor diferente do atualmente selecionado
  const currentWeekly =
    weekly && selectedSectorId && weekly.setor_id === selectedSectorId
      ? weekly
      : null;

  // Criação explícita de Weekly (W03)
  const createWeeklyMutation = useAsyncMutation(
    async () => {
      const targetSectorId = selectedSectorIdRef.current;
      if (!targetSectorId) {
        throw new Error('Selecione um setor para criar a weekly.');
      }
      const newWeekly = await weekliesApi.create({ setor_id: targetSectorId });
      return { newWeekly, targetSectorId };
    },
    {
      onSuccess: ({ newWeekly, targetSectorId }) => {
        if (
          targetSectorId !== selectedSectorIdRef.current ||
          newWeekly.setor_id !== selectedSectorIdRef.current
        ) {
          return;
        }
        setWeekly(newWeekly);
        setWeeklyNotFoundError(false);
        showAlertDialog({
          type: 'success',
          title: 'Weekly iniciada',
          message:
            'Relatório da semana criado com sucesso. Tarefas anteriores pendentes foram herdadas automaticamente.',
        });
      },
    },
  );

  // Submissão da Weekly (W05)
  const submitWeeklyMutation = useAsyncMutation(
    async () => {
      const currentSector = selectedSectorIdRef.current;
      if (
        !currentWeekly ||
        !currentSector ||
        currentWeekly.setor_id !== currentSector
      ) {
        throw new Error(
          'O setor selecionado mudou. Aguarde o carregamento da weekly correspondente.',
        );
      }
      if (isLoadingWeekly) {
        throw new Error('Aguarde o carregamento da weekly correspondente.');
      }
      if (currentWeekly.tasks.length === 0) {
        throw new Error(
          'Adicione pelo menos uma tarefa à weekly para poder enviar o relatório.',
        );
      }
      const targetSectorId = currentSector;
      const targetWeeklyId = currentWeekly.id;
      await weekliesApi.submit(targetWeeklyId);
      return { targetSectorId };
    },
    {
      onSuccess: ({ targetSectorId }) => {
        if (targetSectorId !== selectedSectorIdRef.current) return;
        setIsReviewSheetOpen(false);
        setHerdadaDecisions({});
        showAlertDialog({
          type: 'success',
          title: 'Weekly enviada',
          message: 'Relatório enviado com sucesso para avaliação.',
        });
        refreshCurrentWeekly();
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

  // Reabertura da Weekly (W06)
  const reopenWeeklyMutation = useAsyncMutation(
    async () => {
      const currentSector = selectedSectorIdRef.current;
      if (
        !currentWeekly ||
        !currentSector ||
        currentWeekly.setor_id !== currentSector
      ) {
        throw new Error(
          'O setor selecionado mudou. Aguarde o carregamento da weekly correspondente.',
        );
      }
      if (isLoadingWeekly) {
        throw new Error('Aguarde o carregamento da weekly correspondente.');
      }
      const targetSectorId = currentSector;
      const targetWeeklyId = currentWeekly.id;
      await weekliesApi.reopen(targetWeeklyId);
      return { targetSectorId };
    },
    {
      onSuccess: ({ targetSectorId }) => {
        if (targetSectorId !== selectedSectorIdRef.current) return;
        showAlertDialog({
          type: 'success',
          title: 'Weekly reaberta',
          message:
            'Weekly reaberta com sucesso. Você pode editar as tarefas novamente.',
        });
        refreshCurrentWeekly();
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

  // Atualização de item de tarefa (W10)
  const handleUpdateTaskItem = async (
    weeklyTaskId: string,
    changes: { concluida?: boolean; impedimento?: string | null },
  ) => {
    const currentSector = selectedSectorIdRef.current;
    if (
      !isMounted.current ||
      !currentWeekly ||
      currentWeekly.setor_id !== currentSector
    )
      return;
    const targetSectorId = currentSector;
    const targetWeeklyId = currentWeekly.id;
    try {
      setActiveMutationsCount(c => c + 1);
      const updated = await weekliesApi.updateTaskItem(
        targetWeeklyId,
        weeklyTaskId,
        changes,
      );
      if (!isMounted.current || selectedSectorIdRef.current !== targetSectorId)
        return;
      setWeekly(prev => {
        if (
          !prev ||
          prev.id !== targetWeeklyId ||
          prev.setor_id !== selectedSectorIdRef.current
        )
          return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => (t.id === weeklyTaskId ? updated : t)),
        };
      });
    } catch (err) {
      if (!isMounted.current || selectedSectorIdRef.current !== targetSectorId)
        return;
      showAlertDialog({
        type: 'error',
        title: 'Erro ao atualizar tarefa',
        message:
          err instanceof Error
            ? err.message
            : 'Não foi possível salvar as alterações na tarefa.',
      });
      if (selectedSectorIdRef.current === targetSectorId)
        refreshCurrentWeekly();
    } finally {
      if (isMounted.current) setActiveMutationsCount(c => Math.max(0, c - 1));
    }
  };

  // Remoção de vínculo da tarefa (W11)
  const handleRemoveTaskItem = async (weeklyTaskId: string) => {
    const currentSector = selectedSectorIdRef.current;
    if (
      !isMounted.current ||
      !currentWeekly ||
      currentWeekly.setor_id !== currentSector
    )
      return;
    const targetSectorId = currentSector;
    const targetWeeklyId = currentWeekly.id;
    try {
      setActiveMutationsCount(c => c + 1);
      await weekliesApi.removeTaskItem(targetWeeklyId, weeklyTaskId);
      if (!isMounted.current || selectedSectorIdRef.current !== targetSectorId)
        return;
      setWeekly(prev => {
        if (
          !prev ||
          prev.id !== targetWeeklyId ||
          prev.setor_id !== selectedSectorIdRef.current
        )
          return prev;
        return {
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== weeklyTaskId),
        };
      });
      showAlertDialog({
        type: 'success',
        title: 'Tarefa removida',
        message: 'A tarefa foi desvinculada desta weekly.',
      });
    } catch (err) {
      if (!isMounted.current || selectedSectorIdRef.current !== targetSectorId)
        return;
      showAlertDialog({
        type: 'error',
        title: 'Erro ao remover tarefa',
        message:
          err instanceof Error
            ? err.message
            : 'Não foi possível remover a tarefa da weekly.',
      });
    } finally {
      if (isMounted.current) setActiveMutationsCount(c => Math.max(0, c - 1));
    }
  };

  const isEditable = Boolean(
    currentWeekly &&
    (currentWeekly.status === 'RASCUNHO' ||
      (currentWeekly.status === 'REJEITADA' &&
        isRejeitadaWithinGracePeriod(currentWeekly.avaliada_em))),
  );

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

  const canSubmit = Boolean(
    currentWeekly &&
    !isLoadingWeekly &&
    selectedSectorId &&
    currentWeekly.setor_id === selectedSectorId &&
    isEditable &&
    currentWeekly.tasks.length > 0 &&
    activeMutationsCount === 0 &&
    pendingTaskIds.size === 0 &&
    !submitWeeklyMutation.isMutating,
  );

  const { retrospectiveTasks, uncompletedRetrospectiveTasks, plannedTasks } =
    useMemo(
      () =>
        partitionWeeklyTasks(
          currentWeekly?.tasks ?? [],
          isEditable ? herdadaDecisions : undefined,
        ),
      [currentWeekly?.tasks, isEditable, herdadaDecisions],
    );

  const pendingHerdadaCount = useMemo(() => {
    if (!isEditable) return 0;
    return (currentWeekly?.tasks ?? [])
      .filter(Boolean)
      .filter(
        t =>
          t.origem === 'HERDADA' &&
          getHerdadaReviewDecision(t, herdadaDecisions) === 'pendente',
      ).length;
  }, [isEditable, currentWeekly?.tasks, herdadaDecisions]);

  const handleHerdadaDecision = async (
    weeklyTaskId: string,
    decision: 'concluida' | 'nao_concluida',
  ) => {
    setHerdadaDecisions(prev => ({ ...prev, [weeklyTaskId]: decision }));
    await handleUpdateTaskItem(weeklyTaskId, {
      concluida: decision === 'concluida',
      ...(decision === 'concluida' ? { impedimento: null } : {}),
    });
  };

  const handleOpenReviewSheet = () => {
    if (pendingHerdadaCount > 0) {
      showAlertDialog({
        type: 'warning',
        title: 'Revisão pendente',
        message:
          'Revise todas as tarefas herdadas da semana anterior (marcando como Concluída ou Não concluída) antes de enviar a weekly.',
      });
      return;
    }
    setIsReviewSheetOpen(true);
  };

  return {
    weekly,
    currentWeekly,
    isLoadingWeekly,
    weeklyNotFoundError,
    sectorDetail,
    isSectorLeader,
    canRemoveHerdada,
    createWeeklyMutation,
    submitWeeklyMutation,
    reopenWeeklyMutation,
    handleUpdateTaskItem,
    handleRemoveTaskItem,
    handlePendingChange,
    herdadaDecisions,
    handleHerdadaDecision,
    pendingHerdadaCount,
    retrospectiveTasks,
    uncompletedRetrospectiveTasks,
    plannedTasks,
    isEditable,
    canSubmit,
    addTaskModalMode,
    setAddTaskModalMode,
    isReviewSheetOpen,
    setIsReviewSheetOpen,
    handleOpenReviewSheet,
    refreshCurrentWeekly,
  };
}
