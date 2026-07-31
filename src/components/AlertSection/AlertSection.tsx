import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { UserItem } from '@/types/dashboard';
import { getInitials } from '@/utils/formatName';

interface AlertSectionProps {
  alertStudents: UserItem[];
}

export function AlertSection({ alertStudents }: AlertSectionProps) {
  if (alertStudents.length === 0) return null;

  return (
    <Card className="border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 overflow-hidden shadow-sm">
      <CardHeader className="bg-red-100/60 dark:bg-red-950/50 px-5 py-4 border-b border-red-200/60 dark:border-red-900/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-red-500/10 dark:bg-red-500/20 rounded-md">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-base font-semibold text-red-900 dark:text-red-200">
            Alunos sem Weekly ({alertStudents.length})
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className="bg-red-200/50 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800 text-xs"
        >
          Ação Necessária
        </Badge>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-red-100 dark:divide-red-900/30">
        {alertStudents.map(student => (
          <div
            key={student.id}
            className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-red-100/30 dark:hover:bg-red-900/20 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-10 h-10 border border-red-200 dark:border-red-800 shrink-0">
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-bold text-xs">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                  {student.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {student.projects.join(', ')}
                </p>
              </div>
            </div>
            <Badge className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white border-none text-xs w-fit shrink-0 shadow-sm">
              {student.weeksWithoutReport}+ semanas
            </Badge>
          </div>
        ))}
      </CardContent>

      <CardFooter className="bg-red-100/30 dark:bg-red-950/30 px-5 py-3 border-t border-red-200/60 dark:border-red-900/40 justify-end">
        <Link
          to="/admin/participantes"
          className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400 hover:underline flex items-center gap-1 group"
        >
          Ver todos os participantes
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
