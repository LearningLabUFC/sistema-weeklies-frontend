import { Link2, Plus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { CollaboratorInlinePicker } from '@/features/weeklies/components/CollaboratorInlinePicker';
import { formatDateCivil } from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import type { EligibleCollaborator, TaskResponse } from '@/types/weeklies';

interface AddWeeklyTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyId: string;
  sectorId: string;
  existingTaskIds: string[];
  onSuccess: () => void;
  defaultCompleted?: boolean;
}

export function AddWeeklyTaskModal({
  isOpen,
  onClose,
  weeklyId,
  sectorId,
  existingTaskIds,
  onSuccess,
  defaultCompleted = false,
}: AddWeeklyTaskModalProps) {
  const { showAlertDialog } = useAlertDialog();
  const [tab, setTab] = useState<'nova' | 'existente'>('nova');

  // Form: Nova Tarefa
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prazoConclusao, setPrazoConclusao] = useState('');
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<EligibleCollaborator | null>(null);

  // Form: Tarefa Existente
  const [pendingTasks, setPendingTasks] = useState<TaskResponse[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const handleClose = () => {
    setTitulo('');
    setDescricao('');
    setPrazoConclusao('');
    setSelectedCollaborator(null);
    setSelectedTaskId('');
    setTab('nova');
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    tasksApi
      .getMyTasks({ setor_id: sectorId, status: 'PENDENTE', limite: 50 })
      .then(res => {
        if (isCancelled) return;
        const available = res.tasks.filter(
          t => !existingTaskIds.includes(t.id),
        );
        setPendingTasks(available);
      })
      .catch(err => {
        console.error('Erro ao buscar tarefas pendentes:', err);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingPending(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, sectorId, existingTaskIds]);

  const addMutation = useAsyncMutation(
    async () => {
      if (tab === 'nova') {
        const cleanTitulo = titulo.trim();
        if (!cleanTitulo) {
          throw new Error('Informe o título da tarefa.');
        }
        if (cleanTitulo.length > 255) {
          throw new Error('O título não pode exceder 255 caracteres.');
        }

        const createdItem = await weekliesApi.addTask(weeklyId, {
          titulo: cleanTitulo,
          descricao: descricao.trim() ? descricao.trim() : undefined,
          prazo_conclusao:
            !defaultCompleted && prazoConclusao ? prazoConclusao : undefined,
          ...(defaultCompleted ? { concluida: true } : {}),
        });

        let inviteFailed = false;
        if (
          selectedCollaborator &&
          createdItem?.task_id &&
          typeof tasksApi.assign === 'function'
        ) {
          try {
            await tasksApi.assign(createdItem.task_id, {
              atribuido_id: selectedCollaborator.id,
            });
          } catch (err) {
            console.error('Erro ao enviar convite de colaboração:', err);
            inviteFailed = true;
          }
        }

        return { createdItem, inviteFailed };
      } else {
        if (!selectedTaskId) {
          throw new Error('Selecione uma tarefa existente para vincular.');
        }

        const createdItem = await weekliesApi.addTask(weeklyId, {
          task_id: selectedTaskId,
          ...(defaultCompleted ? { concluida: true } : {}),
        });
        return { createdItem, inviteFailed: false };
      }
    },
    {
      onSuccess: ({ inviteFailed }) => {
        showAlertDialog({
          type: inviteFailed ? 'warning' : 'success',
          title: inviteFailed
            ? 'Tarefa adicionada com aviso'
            : 'Tarefa adicionada',
          message: inviteFailed
            ? 'A tarefa foi adicionada à weekly, mas não foi possível enviar o convite ao colaborador selecionado.'
            : tab === 'nova'
              ? selectedCollaborator
                ? `Nova tarefa adicionada e convite enviado para ${selectedCollaborator.nome_completo}.`
                : 'Nova tarefa criada e adicionada à weekly com sucesso.'
              : 'Tarefa vinculada à weekly com sucesso.',
        });
        onSuccess();
        handleClose();
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.execute();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              {defaultCompleted
                ? 'Adicionar Entrega Realizada'
                : 'Adicionar Tarefa à Weekly'}
            </DialogTitle>
            <DialogDescription>
              {defaultCompleted
                ? 'Registre uma atividade que você concluiu na semana anterior (não planejada) ou vincule uma tarefa existente.'
                : 'Crie uma nova tarefa inline ou vincule uma tarefa pendente existente.'}
            </DialogDescription>
          </DialogHeader>

          {/* Abas / Modos */}
          <div className="grid grid-cols-2 gap-2 p-1 mt-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setTab('nova')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                tab === 'nova'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Criar Nova Tarefa
            </button>
            <button
              type="button"
              onClick={() => setTab('existente')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                tab === 'existente'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              Vincular Existente ({pendingTasks.length})
            </button>
          </div>

          <div className="space-y-4 py-4">
            {addMutation.error && (
              <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200">
                {addMutation.error.message}
              </div>
            )}

            {tab === 'nova' ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="task-titulo">
                    Título da tarefa <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="task-titulo"
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder="Ex: Implementar autenticação JWT"
                    maxLength={255}
                    disabled={addMutation.isMutating}
                    autoFocus
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Obrigatório</span>
                    <span>{titulo.length}/255</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="task-descricao">Descrição (opcional)</Label>
                  <Textarea
                    id="task-descricao"
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Detalhes ou critérios de aceitação..."
                    rows={3}
                    disabled={addMutation.isMutating}
                  />
                </div>

                {!defaultCompleted && (
                  <div className="space-y-1.5">
                    <Label htmlFor="task-prazo">
                      Prazo sugerido de conclusão (opcional)
                    </Label>
                    <Input
                      id="task-prazo"
                      type="date"
                      value={prazoConclusao}
                      onChange={e => setPrazoConclusao(e.target.value)}
                      disabled={addMutation.isMutating}
                    />
                    <p className="text-[11px] text-slate-400">
                      Se omitido, o sistema calculará o prazo padrão
                      configurado.
                    </p>
                  </div>
                )}

                <CollaboratorInlinePicker
                  selectedCollaborator={selectedCollaborator}
                  onSelect={setSelectedCollaborator}
                  disabled={addMutation.isMutating}
                />
              </>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="select-existing-task">
                  Selecione uma tarefa pendente deste setor
                </Label>
                {isLoadingPending ? (
                  <div className="flex items-center gap-2 p-3 text-sm text-slate-500 border rounded-md">
                    <Spinner className="w-4 h-4 animate-spin" />
                    Carregando tarefas pendentes...
                  </div>
                ) : pendingTasks.length === 0 ? (
                  <p className="p-3 text-xs text-slate-500 border rounded-md bg-slate-50 dark:bg-slate-800">
                    Não há tarefas pendentes avulsas neste setor para vincular.
                    Crie uma nova tarefa na aba ao lado.
                  </p>
                ) : (
                  <Select
                    value={selectedTaskId}
                    onValueChange={setSelectedTaskId}
                    disabled={addMutation.isMutating}
                  >
                    <SelectTrigger id="select-existing-task">
                      <SelectValue placeholder="Escolha uma tarefa pendente..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {pendingTasks.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.titulo}{' '}
                          {t.prazo_conclusao
                            ? `(Prazo: ${formatDateCivil(t.prazo_conclusao)})`
                            : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addMutation.isMutating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                addMutation.isMutating ||
                (tab === 'nova' && !titulo.trim()) ||
                (tab === 'existente' && !selectedTaskId)
              }
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {addMutation.isMutating && <Spinner className="w-4 h-4" />}
              {tab === 'nova' ? 'Adicionar Tarefa' : 'Vincular Tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
