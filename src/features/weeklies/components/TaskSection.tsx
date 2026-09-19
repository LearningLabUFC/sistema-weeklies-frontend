import { CircleAlert, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { WeeklyTask } from '@/mock/projects';

interface TaskSectionProps {
  mode: 'past' | 'current';
  title: string;
  date: string;
  tasks: WeeklyTask[];
  emptyMessage: string;
  addLabel: string;
  onAdd: () => void;
  onUpdate: (taskId: string, changes: Partial<WeeklyTask>) => void;
  onRemove: (taskId: string) => void;
}

export const TaskSection = ({
  mode,
  title,
  date,
  tasks,
  emptyMessage,
  addLabel,
  onAdd,
  onUpdate,
  onRemove,
}: TaskSectionProps) => (
  <section className="space-y-4">
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h3 className="font-heading text-base font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">Semana de {date}</p>
      </div>
      <span className="text-xs text-muted-foreground">
        {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
      </span>
    </div>

    <div className="space-y-3">
      {tasks.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )}

      {tasks.map(task => (
        <div
          key={task.id}
          className={`rounded-lg border p-3 transition-colors ${
            mode === 'past' && task.completed
              ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
              : 'border-border'
          }`}
        >
          <div className="flex items-start gap-3">
            {mode === 'past' && (
              <Checkbox
                id={`${task.id}-completed`}
                checked={task.completed}
                onCheckedChange={checked =>
                  onUpdate(task.id, { completed: checked === true })
                }
                aria-label="Marcar tarefa como concluída"
              />
            )}
            {mode === 'past' ? (
              <Label
                htmlFor={`${task.id}-completed`}
                className="flex-1 cursor-pointer leading-6"
              >
                {task.content}
              </Label>
            ) : (
              <Input
                aria-label="Descrição da tarefa"
                className="h-9 flex-1"
                placeholder="Descreva a tarefa"
                value={task.content}
                onChange={event =>
                  onUpdate(task.id, { content: event.target.value })
                }
              />
            )}
            {mode === 'current' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(task.id)}
                aria-label="Remover tarefa"
              >
                <Trash2 />
              </Button>
            )}
          </div>

          {mode === 'past' && (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant={task.hasBlocker ? 'secondary' : 'outline'}
                size="sm"
                className="w-full sm:w-fit"
                onClick={() =>
                  onUpdate(task.id, {
                    hasBlocker: !task.hasBlocker,
                    blockerReason: task.hasBlocker ? '' : task.blockerReason,
                  })
                }
              >
                <CircleAlert />
                {task.hasBlocker
                  ? 'Remover impedimento'
                  : 'Registrar impedimento'}
              </Button>
              {task.hasBlocker && (
                <span className="text-xs text-muted-foreground">
                  Explique o que bloqueou esta tarefa abaixo.
                </span>
              )}
            </div>
          )}

          {mode === 'past' && task.hasBlocker && (
            <div className="mt-3 space-y-2">
              <Label htmlFor={`${task.id}-blocker`}>
                Motivo do impedimento
              </Label>
              <Textarea
                id={`${task.id}-blocker`}
                placeholder="Descreva o motivo do impedimento..."
                value={task.blockerReason}
                onChange={event =>
                  onUpdate(task.id, { blockerReason: event.target.value })
                }
              />
            </div>
          )}
        </div>
      ))}
    </div>

    {mode === 'current' && (
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus /> {addLabel}
      </Button>
    )}
  </section>
);
