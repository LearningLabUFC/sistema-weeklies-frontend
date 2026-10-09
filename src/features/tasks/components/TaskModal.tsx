import { FileText } from 'lucide-react';
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
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import type { TaskResponse } from '@/types/weeklies';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskResponse | null;
  defaultSectorId?: string | null;
  onSuccess: () => void;
}

function TaskModalContent({
  onClose,
  taskToEdit,
  defaultSectorId,
  onSuccess,
}: Omit<TaskModalProps, 'isOpen'>) {
  const { showAlertDialog } = useAlertDialog();
  const { mySectors } = useSectorContext();

  const isEditing = Boolean(taskToEdit);

  const [setorId, setSetorId] = useState(() => {
    if (taskToEdit?.setor_id) return taskToEdit.setor_id;
    if (defaultSectorId && mySectors.some(s => s.id === defaultSectorId)) {
      return defaultSectorId;
    }
    return mySectors.length > 0 ? mySectors[0].id : '';
  });

  // Atualiza setorId quando mySectors ou defaultSectorId carregarem
  useEffect(() => {
    if (!isEditing && !setorId && mySectors.length > 0) {
      const nextId =
        defaultSectorId && mySectors.some(s => s.id === defaultSectorId)
          ? defaultSectorId
          : mySectors[0].id;
      const timer = setTimeout(() => {
        setSetorId(nextId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing, setorId, mySectors, defaultSectorId]);
  const [titulo, setTitulo] = useState(taskToEdit?.titulo || '');
  const [descricao, setDescricao] = useState(taskToEdit?.descricao || '');
  const [prazoConclusao, setPrazoConclusao] = useState(
    taskToEdit?.prazo_conclusao || '',
  );

  const saveMutation = useAsyncMutation(
    async () => {
      const cleanTitulo = titulo.trim();
      if (!cleanTitulo) {
        throw new Error('O título da tarefa é obrigatório.');
      }
      if (cleanTitulo.length > 255) {
        throw new Error('O título não pode ter mais de 255 caracteres.');
      }

      if (isEditing && taskToEdit) {
        // T03: Atualiza título e descrição
        const res = await tasksApi.update(taskToEdit.id, {
          titulo: cleanTitulo,
          descricao: descricao.trim() ? descricao.trim() : null,
        });

        // Se o prazo foi alterado e a task ainda é PENDENTE, chama T04
        if (
          prazoConclusao &&
          prazoConclusao !== (taskToEdit.prazo_conclusao || '')
        ) {
          await tasksApi.updatePrazo(taskToEdit.id, {
            prazo_conclusao: prazoConclusao,
          });
        }
        return res;
      } else {
        // T02: Cria nova tarefa
        if (!setorId) {
          throw new Error('Selecione o setor da tarefa.');
        }

        return tasksApi.create({
          setor_id: setorId,
          titulo: cleanTitulo,
          descricao: descricao.trim() ? descricao.trim() : undefined,
          prazo_conclusao: prazoConclusao ? prazoConclusao : undefined,
        });
      }
    },
    {
      onSuccess: () => {
        showAlertDialog({
          type: 'success',
          title: isEditing ? 'Tarefa atualizada' : 'Tarefa criada',
          message: isEditing
            ? 'As informações da tarefa foram atualizadas com sucesso.'
            : 'A nova tarefa foi cadastrada com sucesso no setor.',
        });
        onSuccess();
        onClose();
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.execute();
  };

  return (
    <Dialog open={true} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              {isEditing ? 'Editar Tarefa' : 'Nova Tarefa Avulsa'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Atualize o título, descrição ou prazo desta tarefa.'
                : 'Cadastre uma tarefa para acompanhar no setor e vincular às suas weeklies.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {saveMutation.error && (
              <div className="p-3 text-xs rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200">
                {saveMutation.error.message}
              </div>
            )}

            {!isEditing && mySectors.length === 0 && (
              <div className="p-3 text-xs rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                Você não está vinculado a nenhum setor. Para criar tarefas e
                enviar weeklies, é necessário fazer parte de ao menos um setor.
              </div>
            )}

            {!isEditing && (
              <div className="space-y-1.5">
                <Label htmlFor="task-sector">
                  Setor <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={setorId}
                  onValueChange={setSetorId}
                  disabled={saveMutation.isMutating || mySectors.length === 0}
                >
                  <SelectTrigger id="task-sector">
                    <SelectValue
                      placeholder={
                        mySectors.length === 0
                          ? 'Nenhum setor disponível'
                          : 'Selecione o setor...'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {mySectors.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="task-title">
                Título da tarefa <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="task-title"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Refatorar queries de listagem"
                maxLength={255}
                disabled={saveMutation.isMutating}
                autoFocus
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Obrigatório</span>
                <span>{titulo.length}/255</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Descrição (opcional)</Label>
              <Textarea
                id="task-desc"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Detalhes adicionais sobre a tarefa..."
                rows={3}
                disabled={saveMutation.isMutating}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-due-date">Prazo estimado de conclusão</Label>
              <div className="relative">
                <Input
                  id="task-due-date"
                  type="date"
                  value={prazoConclusao}
                  onChange={e => setPrazoConclusao(e.target.value)}
                  disabled={saveMutation.isMutating}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Se omitido, o sistema calculará o prazo padrão configurado.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saveMutation.isMutating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                saveMutation.isMutating ||
                !titulo.trim() ||
                (!isEditing && (!setorId || mySectors.length === 0))
              }
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {saveMutation.isMutating && <Spinner className="w-4 h-4" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TaskModal(props: TaskModalProps) {
  if (!props.isOpen) return null;
  return <TaskModalContent {...props} />;
}
