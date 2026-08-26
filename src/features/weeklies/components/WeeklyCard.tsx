import { Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProjectSection } from '@/features/weeklies/components/ProjectSection';
import type { WeeklyTask } from '@/types/weeklies';

interface WeeklyCardProps {
  dateWeek: string;
  tasks?: WeeklyTask[];
}

const groupTasksByProject = (tasks: WeeklyTask[] = []) => {
  const groups: {
    [key: string]: {
      name: string;
      past: string[];
      current: string[];
      blockers: string[];
    };
  } = {};

  tasks.forEach(task => {
    const projectName = task.project_name || 'Geral';

    if (!groups[projectName]) {
      groups[projectName] = {
        name: projectName,
        past: [],
        current: [],
        blockers: [],
      };
    }

    if (task.type === 'past') {
      groups[projectName].past.push(task.content);
    } else {
      groups[projectName].current.push(task.content);
    }

    if (task.status === 'blocked') {
      groups[projectName].blockers.push(task.content);
    }
  });

  return Object.values(groups);
};

export const WeeklyCard = ({ dateWeek, tasks = [] }: WeeklyCardProps) => {
  const projects = groupTasksByProject(tasks);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border-transparent dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader className="bg-indigo-500/5 to-transparent py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span className="text-foreground">
            Semana de {formatDate(dateWeek)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {projects.map((project, index) => (
          <div key={index} className="space-y-6">
            <ProjectSection project={project} />

            {index < projects.length - 1 && (
              <Separator className="bg-border/60" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
