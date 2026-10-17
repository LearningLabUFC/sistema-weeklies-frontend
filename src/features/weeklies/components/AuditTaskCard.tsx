import { Calendar, CheckCircle2, Clock, Trash2, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { TaskStatusBadge } from '@/features/weeklies/components/TaskStatusBadge';
import {
  formatDateCivil,
  formatTimestampFortaleza,
  isPrazoVencido,
} from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import type { TaskResponse } from '@/types/weeklies';

interface AuditTaskCardProps {
  task: TaskResponse;
  currentUserId?: string;
  onUpdatePrazo: (task: TaskResponse) => void;
  onConclude: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  disabled?: boolean;
}

export function AuditTaskCard({
  task,
  currentUserId,
  onUpdatePrazo,
  onConclude,
  onDelete,
  disabled = false,
}: AuditTaskCardProps) {
  const { showAlertDialog } = useAlertDialog();
  const [isProcessing, setIsProcessing] = useState(false);

  const isSelfTask = Boolean(
    currentUserId && task.usuario_id === currentUserId,
  );
  const isVencida = isPrazoVencido(task.prazo_conclusao);

  const handleConcludeClick = () => {
    if (isSelfTask) {
      showAlertDialog({
        type: 'warning',
        title: 'Auto-conclusão não permitida',
        message:
          'Você não pode concluir sua própria tarefa que está em auditoria.',
      });
      return;
    }

    showAlertDialog({
      type: 'confirm',
      title: 'Concluir tarefa diretamente?',
      message: `Deseja marcar a tarefa "${task.titulo}" como concluída pela liderança? Ela sairá da fila de auditoria.`,
      confirmText: 'Concluir Tarefa',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: async () => {
        try {
          setIsProcessing(true);
          await onConclude(task.id);
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  const handleDeleteClick = () => {
    showAlertDialog({
      type: 'confirm',
      title: 'Remover tarefa do sistema?',
      message: `Atenção: remover esta tarefa alterará seu status global para REMOVIDA_PELO_LIDER e expirará eventuais convites pendentes.`,
      confirmText: 'Remover Definitivamente',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: async () => {
        try {
          setIsProcessing(true);
          await onDelete(task.id);
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  return (
    <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <CardHeader className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground line-clamp-2">
              {task.titulo}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Autor: {task.usuario_id}</span>
              {isSelfTask && (
                <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 px-1.5 py-0.2 rounded font-medium">
                  Sua tarefa
                </span>
              )}
            </div>
          </div>
          <TaskStatusBadge status={task.status} />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 text-xs">
        {task.descricao && (
          <p className="text-muted-foreground line-clamp-3 whitespace-pre-wrap">
            {task.descricao}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Prazo: {formatDateCivil(task.prazo_conclusao)}
              {isVencida && (
                <strong className="text-rose-600 dark:text-rose-400 ml-1 font-semibold">
                  (Vencido)
                </strong>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Entrada em auditoria:{' '}
              {formatTimestampFortaleza(task.entrada_auditoria_em)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 px-4 bg-slate-50/30 dark:bg-slate-800/10 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdatePrazo(task)}
          disabled={disabled || isProcessing}
          className="rounded-xl h-8 text-xs gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span>Prorrogar Prazo</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleConcludeClick}
          disabled={disabled || isProcessing || isSelfTask}
          className={`rounded-xl h-8 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40 ${
            isSelfTask ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={
            isSelfTask
              ? 'Você não pode concluir a sua própria tarefa'
              : undefined
          }
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Concluir Tarefa</span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleDeleteClick}
          disabled={disabled || isProcessing}
          className="rounded-xl h-8 text-xs gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remover</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
