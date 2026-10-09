import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { TaskStatus } from '@/types/weeklies';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function TaskStatusBadge({
  status,
  className = '',
}: TaskStatusBadgeProps) {
  switch (status) {
    case 'PENDENTE':
      return (
        <Badge
          variant="outline"
          className={`bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 gap-1.5 font-medium ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pendente
        </Badge>
      );
    case 'CONCLUIDA':
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 gap-1.5 font-medium ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Concluída
        </Badge>
      );
    case 'EM_AUDITORIA':
      return (
        <Badge
          variant="outline"
          className={`bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800 gap-1.5 font-medium ${className}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Em Auditoria
        </Badge>
      );
    case 'REMOVIDA_PELO_LIDER':
      return (
        <Badge
          variant="outline"
          className={`bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 gap-1.5 font-medium ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Removida pelo Líder
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
}
