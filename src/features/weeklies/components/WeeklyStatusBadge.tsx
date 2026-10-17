import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileEdit,
  Send,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { WeeklyStatus } from '@/types/weeklies';

interface WeeklyStatusBadgeProps {
  status: WeeklyStatus;
  className?: string;
}

export function WeeklyStatusBadge({
  status,
  className = '',
}: WeeklyStatusBadgeProps) {
  switch (status) {
    case 'RASCUNHO':
      return (
        <Badge
          variant="outline"
          className={`bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 gap-1.5 font-medium ${className}`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          Rascunho
        </Badge>
      );
    case 'ENVIADA':
      return (
        <Badge
          variant="outline"
          className={`bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800 gap-1.5 font-medium ${className}`}
        >
          <Send className="w-3.5 h-3.5" />
          Enviada
        </Badge>
      );
    case 'APROVADA':
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 gap-1.5 font-medium ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Aprovada
        </Badge>
      );
    case 'REJEITADA':
      return (
        <Badge
          variant="outline"
          className={`bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 gap-1.5 font-medium ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Rejeitada
        </Badge>
      );
    case 'EXPIRADA':
      return (
        <Badge
          variant="outline"
          className={`bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 gap-1.5 font-medium ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Expirada
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
