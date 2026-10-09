import {
  AlertTriangle,
  FolderKanban,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header/Header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { isAdminRole } from '@/config/roles';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { AddWeeklyTaskModal } from '@/features/weeklies/components/AddWeeklyTaskModal';
import { WeeklyStatusBadge } from '@/features/weeklies/components/WeeklyStatusBadge';
import { WeeklySubmissionBanner } from '@/features/weeklies/components/WeeklySubmissionBanner';
import { WeeklyTaskItemCard } from '@/features/weeklies/components/WeeklyTaskItemCard';
import {
  formatDateCivil,
  isRejeitadaWithinGracePeriod,
} from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import { useAuth } from '@/hooks/useAuth';
import { parseApiError } from '@/lib/errorHandler';
import type { SectorDetail } from '@/types/sectors';
import type { WeeklyResponse } from '@/types/weeklies';

export default function Weeklies() {
  const { user } = useAuth();
  const { selectedSectorId } = useSectorContext();

  // Cada contexto tem seu próprio estado, inclusive modais e mutações pendentes.
  return <SectorWeeklies key={`${user?.id ?? ''}:${selectedSectorId ?? ''}`} />;
}

function SectorWeeklies() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showAlertDialog } = useAlertDialog();
  const {
    sectors,
    mySectors,
    selectedSectorId,
    selectedSector,
    setSelectedSectorId,
    isLoading: isLoadingSectors,
  } = useSectorContext();

  const allowedSectors = useMemo(() => {
    if (mySectors !== undefined) {
      return mySectors;
    }
    return sectors;
  }, [mySectors, sectors]);

  const hasNoSector =
    !isLoadingSectors &&
    !isAdminRole(user?.global_role) &&
    mySectors !== undefined &&
    mySectors.length === 0;

  useEffect(() => {
    if (isAdminRole(user?.global_role) || isLoadingSectors) return;
    if (mySectors !== undefined) {
      if (mySectors.length > 0) {
        if (
          !selectedSectorId ||
          !mySectors.some(s => s.id === selectedSectorId)
        ) {
          setSelectedSectorId(mySectors[0].id);
        }
      } else if (selectedSectorId) {
        setSelectedSectorId(null);
      }
    }
  }, [
    user?.global_role,
    isLoadingSectors,
    mySectors,
    selectedSectorId,
    setSelectedSectorId,
  ]);

  const [weekly, setWeekly] = useState<WeeklyResponse | null>(null);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(
    Boolean(selectedSectorId && !isAdminRole(user?.global_role)),
  );
  const [weeklyNotFoundError, setWeeklyNotFoundError] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [activeMutationsCount, setActiveMutationsCount] = useState(0);
  const isMounted = useRef(true);

  // Mantém referência síncrona ao setor atual para checagens de respostas atrasadas
  const selectedSectorIdRef = useRef(selectedSectorId);
  useEffect(() => {
    selectedSectorIdRef.current = selectedSectorId;
  }, [selectedSectorId]);

  // Reset síncrono durante a renderização ao trocar de setor
  const [prevSectorId, setPrevSectorId] = useState(selectedSectorId);
  if (prevSectorId !== selectedSectorId) {
    setPrevSectorId(selectedSectorId);
    setWeekly(null);
    setIsAddTaskModalOpen(false);
    setWeeklyNotFoundError(false);
    setIsLoadingWeekly(
      Boolean(selectedSectorId && !isAdminRole(user?.global_role)),
    );
  }

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [sectorDetail, setSectorDetail] = useState<SectorDetail | null>(null);

  useEffect(() => {
    if (!selectedSectorId) return;

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
  }, [selectedSectorId]);

  // Determina se o usuário é líder no setor selecionado ou admin
  const isSectorLeader = Boolean(
    sectorDetail?.membros?.some(m => m.id === user?.id && m.papel === 'lider'),
  );
  const isAdmin = isAdminRole(user?.global_role);
  const canRemoveHerdada = isAdmin || isSectorLeader;

  const [weeklyRefreshTrigger, setWeeklyRefreshTrigger] = useState(0);
  const refreshCurrentWeekly = () => {
    if (!isMounted.current) return;
    setIsLoadingWeekly(true);
    setWeeklyRefreshTrigger(t => t + 1);
  };

  useEffect(() => {
    if (!selectedSectorId || isAdmin) {
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
  }, [selectedSectorId, isAdmin, weeklyRefreshTrigger, showAlertDialog]);

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
        // Ignora respostas atrasadas que não pertençam ao setor atualmente selecionado
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
        showAlertDialog({
          type: 'success',
          title: 'Weekly enviada',
          message: 'Relatório enviado com sucesso para avaliação.',
        });
        refreshCurrentWeekly();
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
      // Atualiza localmente sem piscar
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
      // Re-fetch para sincronizar estado
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

  // Estado de editabilidade
  const isEditable = Boolean(
    currentWeekly &&
    (currentWeekly.status === 'RASCUNHO' ||
      (currentWeekly.status === 'REJEITADA' &&
        isRejeitadaWithinGracePeriod(currentWeekly.avaliada_em))),
  );

  const canSubmit = Boolean(
    currentWeekly &&
    !isLoadingWeekly &&
    selectedSectorId &&
    currentWeekly.setor_id === selectedSectorId &&
    isEditable &&
    currentWeekly.tasks.length > 0 &&
    activeMutationsCount === 0 &&
    !submitWeeklyMutation.isMutating,
  );

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl py-6 sm:py-10 space-y-6">
      <Header
        title="Relatório de Weekly"
        subtitle="Acompanhe suas tarefas e registre seu progresso semanal por setor"
      />

      {/* Seletor de Setor */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Setor de Atuação
            </span>
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {selectedSector?.nome || 'Nenhum setor selecionado'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-72">
            {isLoadingSectors ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-2 border rounded-md w-full">
                <Spinner className="w-4 h-4 animate-spin" /> Carregando
                setores...
              </div>
            ) : allowedSectors.length === 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/setores')}
                className="w-full text-xs"
              >
                Explorar catálogo de setores
              </Button>
            ) : (
              <Select
                value={selectedSectorId || ''}
                onValueChange={val => setSelectedSectorId(val || null)}
              >
                <SelectTrigger id="select-weekly-sector" className="w-full">
                  <SelectValue placeholder="Selecione um setor..." />
                </SelectTrigger>
                <SelectContent>
                  {allowedSectors.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome} {!s.ativo && '(Inativo)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Caso o membro não pertença a nenhum setor */}
      {hasNoSector && (
        <Card className="border-dashed p-8 text-center space-y-4 max-w-2xl mx-auto border-slate-300 dark:border-slate-800">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-400" />
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              Você ainda não foi vinculado a um setor
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Para iniciar o envio de relatórios de weekly, você precisa fazer
              parte de uma equipe ativa. Conheça as frentes de trabalho no
              Catálogo de Setores e solicite seu ingresso à liderança ou
              coordenação.
            </p>
          </div>
          <Button
            onClick={() => navigate('/setores')}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <FolderKanban className="w-4 h-4" />
            Conhecer Setores do Laboratório
          </Button>
        </Card>
      )}

      {/* Caso não tenha setor selecionado mas tenha setores permitidos */}
      {!selectedSectorId && !hasNoSector && (
        <Card className="border-dashed p-8 text-center space-y-3">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Selecione um setor para visualizar a weekly
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cada setor possui seu próprio ciclo semanal de atividades. Escolha
              um setor acima ou participe de um novo setor no catálogo.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/setores')}
            className="text-xs gap-1.5"
          >
            Ver catálogo de setores
          </Button>
        </Card>
      )}

      {/* Loading da Weekly */}
      {selectedSectorId && isLoadingWeekly && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="w-8 h-8 text-indigo-600" />
          <span className="text-xs text-slate-500 font-medium">
            Carregando weekly da semana...
          </span>
        </div>
      )}

      {/* Nenhuma weekly criada (W02 retornou 404) */}
      {selectedSectorId && !isLoadingWeekly && weeklyNotFoundError && (
        <Card className="border-indigo-100 bg-indigo-50/30 dark:border-indigo-950/60 dark:bg-indigo-950/10 p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Iniciar Weekly Desta Semana
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Você ainda não iniciou a weekly desta semana no setor{' '}
              <strong>{selectedSector?.nome}</strong>. Ao iniciar, tarefas
              pendentes de semanas anteriores serão importadas automaticamente.
            </p>
          </div>

          {createWeeklyMutation.error && (
            <div className="max-w-md mx-auto p-3 text-xs rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200">
              {createWeeklyMutation.error.message}
            </div>
          )}

          <Button
            type="button"
            onClick={() => createWeeklyMutation.execute()}
            disabled={createWeeklyMutation.isMutating}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {createWeeklyMutation.isMutating ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Criar Weekly da Semana (W03)
          </Button>
        </Card>
      )}

      {/* Weekly Existente */}
      {selectedSectorId && !isLoadingWeekly && currentWeekly && (
        <div className="space-y-6">
          {/* Informações da Weekly e Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Weekly de {formatDateCivil(currentWeekly.semana_referencia)}
                </h3>
                <WeeklyStatusBadge status={currentWeekly.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Setor: {selectedSector?.nome || 'Setor'}
              </p>
            </div>

            {isEditable && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsAddTaskModalOpen(true)}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Adicionar Tarefa
              </Button>
            )}
          </div>

          {/* Banner de Janela de Submissão e Alertas */}
          <WeeklySubmissionBanner
            weekly={currentWeekly}
            onReopen={async () => {
              await reopenWeeklyMutation.execute();
            }}
            isReopening={reopenWeeklyMutation.isMutating}
          />

          {/* Seção de Tarefas */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Tarefas do Relatório
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Marque o que foi concluído ou justifique eventuais
                    impedimentos.
                  </CardDescription>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                  {currentWeekly.tasks.length}{' '}
                  {currentWeekly.tasks.length === 1 ? 'tarefa' : 'tarefas'}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-3">
              {currentWeekly.tasks.length === 0 ? (
                <div className="p-8 text-center space-y-3 border border-dashed rounded-xl">
                  <p className="text-xs text-slate-500">
                    Nenhuma tarefa incluída nesta weekly ainda.
                  </p>
                  {isEditable && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddTaskModalOpen(true)}
                      className="text-xs gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar primeira tarefa
                    </Button>
                  )}
                </div>
              ) : (
                currentWeekly.tasks.map(taskItem => (
                  <WeeklyTaskItemCard
                    key={taskItem.id}
                    taskItem={taskItem}
                    isEditable={isEditable}
                    canRemoveHerdada={canRemoveHerdada}
                    isLastItemInRejeitada={
                      currentWeekly.status === 'REJEITADA' &&
                      currentWeekly.tasks.length === 1
                    }
                    onUpdate={handleUpdateTaskItem}
                    onRemove={handleRemoveTaskItem}
                  />
                ))
              )}
            </CardContent>

            {/* Rodapé com botão de envio */}
            {isEditable && (
              <CardFooter className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  {currentWeekly.tasks.length === 0 && (
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      Adicione pelo menos 1 tarefa para enviar
                    </span>
                  )}
                  {currentWeekly.tasks.length > 0 && (
                    <span>
                      {
                        currentWeekly.tasks.filter(
                          t => t.concluida || t.impedimento,
                        ).length
                      }{' '}
                      de {currentWeekly.tasks.length} tarefa(s) com status
                      registrado
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={() => submitWeeklyMutation.execute()}
                  disabled={!canSubmit}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                >
                  {submitWeeklyMutation.isMutating ? (
                    <Spinner className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Enviar Weekly (W05)
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      )}

      {/* Modal de Adicionar Tarefa */}
      {currentWeekly && (
        <AddWeeklyTaskModal
          key={currentWeekly.id}
          isOpen={
            isAddTaskModalOpen && currentWeekly.setor_id === selectedSectorId
          }
          onClose={() => setIsAddTaskModalOpen(false)}
          weeklyId={currentWeekly.id}
          sectorId={currentWeekly.setor_id}
          existingTaskIds={currentWeekly.tasks.map(t => t.task_id)}
          onSuccess={() => {
            refreshCurrentWeekly();
          }}
        />
      )}
    </div>
  );
}
