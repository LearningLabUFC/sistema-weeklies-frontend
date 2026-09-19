import { CheckCircle2 } from 'lucide-react';

import { Card, CardHeader } from '@/components/ui/card';
import type { WeeklyProject } from '@/mock/projects';

interface WeeklyProgressProps {
  projects: WeeklyProject[];
  filledCount: number;
  canSubmit: boolean;
}

export const WeeklyProgress = ({
  projects,
  filledCount,
  canSubmit,
}: WeeklyProgressProps) => (
  <Card className="rounded-2xl border-transparent bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <CardHeader className="flex-row items-center justify-between gap-3">
      <div className="flex shrink-0 gap-1.5" aria-label="Progresso por projeto">
        {projects.map(project => (
          <span
            key={project.id}
            className={`size-2.5 rounded-full border border-border ${
              project.nextWeekTasks.some(task => task.content.trim())
                ? 'border-green-500 bg-green-500'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {filledCount} de {projects.length} projeto(s) preenchido(s)
      </span>
      {canSubmit && (
        <span className="flex items-center gap-2 text-sm text-green-500">
          <CheckCircle2 className="size-4" /> Pronto para enviar
        </span>
      )}
    </CardHeader>
  </Card>
);
