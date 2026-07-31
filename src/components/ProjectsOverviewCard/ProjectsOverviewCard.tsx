import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { BarChart2, FolderKanban, ArrowRight } from 'lucide-react';
import type { ProjectItem, UserItem } from '@/types/dashboard';

interface ProjectsOverviewCardProps {
  projects: ProjectItem[];
  users: UserItem[];
}

export function ProjectsOverviewCard({
  projects,
  users,
}: ProjectsOverviewCardProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-md">
            <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Projetos ({projects.length})
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/60">
        {projects.map(project => {
          const membersInAlert = users.filter(
            u => project.members.includes(u.id) && u.weeksWithoutReport >= 3,
          ).length;

          return (
            <div
              key={project.id}
              className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                  <FolderKanban className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                    {project.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {project.members.length}{' '}
                    {project.members.length === 1 ? 'membro' : 'membros'}
                  </p>
                </div>
              </div>

              {membersInAlert > 0 ? (
                <Badge
                  variant="destructive"
                  className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs shrink-0"
                >
                  {membersInAlert} sem weekly
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/60 text-xs shrink-0 font-medium"
                >
                  Em dia
                </Badge>
              )}
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="bg-slate-50/50 dark:bg-slate-800/20 px-5 py-3 border-t border-slate-200 dark:border-slate-800 justify-end">
        <Link
          to="/admin/projetos"
          className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group"
        >
          Gerenciar projetos
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
