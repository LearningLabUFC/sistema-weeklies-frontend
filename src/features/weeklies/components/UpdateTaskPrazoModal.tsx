import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

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
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import {
  formatDateCivil,
  isPrazoVencido,
} from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';

interface UpdateTaskPrazoModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitulo: string;
  prazoAtual?: string | null;
  onSuccess: () => void;
}

export function UpdateTaskPrazoModal({
  isOpen,
  onClose,
  taskId,
  taskTitulo,
  prazoAtual,
  onSuccess,
}: UpdateTaskPrazoModalProps) {
  const { showAlertDialog } = useAlertDialog();
  const [novoPrazo, setNovoPrazo] = useState(prazoAtual || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useAsyncMutation(
    async () => {
      const prazoTrim = novoPrazo.trim();
      if (!prazoTrim) {
        throw new Error('Informe o novo prazo de conclusão.');
      }
      if (isPrazoVencido(prazoTrim)) {
        throw new Error('O novo prazo não pode ser uma data retroativa.');
      }
      return await tasksApi.updatePrazo(taskId, {
        prazo_conclusao: prazoTrim,
      });
    },
    {
      onSuccess: () => {
        showAlertDialog({
          type: 'success',
          title: 'Prazo prorrogado',
          message: 'O prazo da tarefa foi atualizado com sucesso.',
        });
        onSuccess();
        onClose();
      },
      onError: err => {
        setErrorMessage(err.message);
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    updateMutation.execute();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-5 h-5" />
            <DialogTitle>Prorrogar Prazo da Tarefa</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Ajuste o prazo de conclusão da tarefa sob auditoria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-muted-foreground block">Tarefa:</span>
            <span className="font-semibold text-foreground text-sm line-clamp-2">
              {taskTitulo}
            </span>
            {prazoAtual && (
              <span className="text-muted-foreground block mt-1">
                Prazo atual: {formatDateCivil(prazoAtual)}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="novo-prazo" className="text-xs font-medium">
              Novo Prazo de Conclusão (Data Civil) *
            </Label>
            <div className="relative">
              <Input
                id="novo-prazo"
                type="date"
                value={novoPrazo}
                onChange={e => setNovoPrazo(e.target.value)}
                className="rounded-xl h-10 text-xs pl-9"
                required
              />
              <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              A data deve ser igual ou posterior à data atual.
            </p>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
              {errorMessage}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl h-9 text-xs"
              disabled={updateMutation.isMutating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={updateMutation.isMutating}
            >
              {updateMutation.isMutating ? 'Salvando...' : 'Salvar Novo Prazo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
