import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { AssignmentStatus } from '@/types/weeklies';

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
  className?: string;
}

export function AssignmentStatusBadge({
  status,
  className = '',
}: AssignmentStatusBadgeProps) {
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
    case 'ACEITA':
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 gap-1.5 font-medium ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Aceita
        </Badge>
      );
    case 'RECUSADA':
      return (
        <Badge
          variant="outline"
          className={`bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 gap-1.5 font-medium ${className}`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Recusada
        </Badge>
      );
    case 'EXPIRADA':
      return (
        <Badge
          variant="outline"
          className={`bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 gap-1.5 font-medium ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Expirada
        </Badge>
      );
  }
}
