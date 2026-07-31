import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Search, CheckCircle2, XCircle } from 'lucide-react';
import type { UserItem } from '@/types/dashboard';
import { getInitials } from '@/utils/formatName';

interface WeeklyStatusCardProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredStudents: UserItem[];
}

export function WeeklyStatusCard({
  searchTerm,
  onSearchChange,
  filteredStudents,
}: WeeklyStatusCardProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-md">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Status de Weeklies
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Acompanhamento de envios da semana atual
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Buscar aluno..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-105 overflow-y-auto">
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => {
            const ok = student.weeksWithoutReport === 0;
            return (
              <div
                key={student.id}
                className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={student.avatar} alt={student.name} />
                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium text-xs">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {student.name}
                  </span>
                </div>

                {ok ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/60 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    Enviou
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shrink-0">
                    <XCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Pendente
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            Nenhum aluno encontrado para "{searchTerm}".
          </div>
        )}
      </CardContent>
    </Card>
  );
}
