import { BookOpen, Hash, CheckCircle, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatName } from '@/utils/formatName';

export interface PendingUser {
  id: string;
  nome_completo: string;
  email: string;
  matricula: string;
  data_ingresso: string;
  curso_id: string;
}

interface RequestCardProps {
  request: PendingUser;
  cursoNome?: string;
  isProcessingAll: boolean;
  onUpdateStatus: (id: string, status: 'ativo' | 'inativo') => void;
}

export const RequestCard = ({
  request,
  cursoNome = 'Curso não encontrado',
  isProcessingAll,
  onUpdateStatus,
}: RequestCardProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 transition-all hover:shadow-md">
      <div className="flex items-start md:items-center gap-4 flex-1">
        <Avatar className="w-12 h-12 border border-slate-100 dark:border-slate-700 shrink-0">
          <AvatarFallback className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium text-lg">
            {request.nome_completo.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 truncate text-base">
              {request.nome_completo}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ingresso: {formatDate(request.data_ingresso)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 truncate">
              <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{cursoNome === 'Curso não encontrado' ? cursoNome : formatName(cursoNome)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 truncate">
              <Hash className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">Matrícula: {request.matricula}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 w-full md:w-auto shrink-0">
        <Button
          variant="outline"
          disabled={isProcessingAll}
          className="flex-1 md:flex-none h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
          onClick={() => onUpdateStatus(request.id, 'inativo')}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Rejeitar
        </Button>
        <Button
          disabled={isProcessingAll}
          className="flex-1 md:flex-none h-10 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
          onClick={() => onUpdateStatus(request.id, 'ativo')}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Aceitar
        </Button>
      </div>
    </div>
  );
};
