import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TaskSection } from '@/features/weeklies/components/TaskSection';
import type { WeeklyProject, WeeklyTask } from '@/mock/projects';

interface ProjectCardProps {
  project: WeeklyProject;
  previousMonday: string;
  currentMonday: string;
  onAddTask: (section: 'lastWeekTasks' | 'nextWeekTasks') => void;
  onUpdateTask: (
    section: 'lastWeekTasks' | 'nextWeekTasks',
    taskId: string,
    changes: Partial<WeeklyTask>,
  ) => void;
  onRemoveTask: (
    section: 'lastWeekTasks' | 'nextWeekTasks',
    taskId: string,
  ) => void;
}

export const ProjectCard = ({
  project,
  previousMonday,
  currentMonday,
  onAddTask,
  onUpdateTask,
  onRemoveTask,
}: ProjectCardProps) => (
  <Card className="rounded-2xl border-transparent bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <CardHeader className="border-b">
      <CardTitle>{project.project}</CardTitle>
      <CardDescription>
        Registre o que foi feito e o que será feito neste projeto.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-7 p-4 sm:p-6">
      <TaskSection
        mode="past"
        title="O que eu fiz na semana passada"
        date={previousMonday}
        tasks={project.lastWeekTasks}
        emptyMessage="Nenhuma tarefa registrada para a semana passada."
        addLabel="Adicionar tarefa realizada"
        onAdd={() => onAddTask('lastWeekTasks')}
        onUpdate={(taskId, changes) =>
          onUpdateTask('lastWeekTasks', taskId, changes)
        }
        onRemove={taskId => onRemoveTask('lastWeekTasks', taskId)}
      />
      <div className="border-t" />
      <TaskSection
        mode="current"
        title="O que eu vou fazer essa semana"
        date={currentMonday}
        tasks={project.nextWeekTasks}
        emptyMessage="Adicione pelo menos uma tarefa para esta semana."
        addLabel="Adicionar tarefa planejada"
        onAdd={() => onAddTask('nextWeekTasks')}
        onUpdate={(taskId, changes) =>
          onUpdateTask('nextWeekTasks', taskId, changes)
        }
        onRemove={taskId => onRemoveTask('nextWeekTasks', taskId)}
      />
    </CardContent>
  </Card>
);
