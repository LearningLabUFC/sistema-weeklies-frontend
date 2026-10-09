import { AlertOctagon, AlertTriangle, ShieldAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { WarningType } from '@/types/weeklies';

interface WarningBadgeProps {
  tipo: WarningType;
  className?: string;
}

export function WarningBadge({ tipo, className = '' }: WarningBadgeProps) {
  switch (tipo) {
    case '1a_ADVERTENCIA':
      return (
        <Badge
          variant="outline"
          className={`bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 gap-1.5 font-semibold ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          1ª Advertência
        </Badge>
      );
    case '2a_ADVERTENCIA':
      return (
        <Badge
          variant="outline"
          className={`bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800 gap-1.5 font-semibold ${className}`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-orange-600" />
          2ª Advertência
        </Badge>
      );
    case 'DESLIGAMENTO':
      return (
        <Badge
          variant="destructive"
          className={`bg-rose-600 text-white gap-1.5 font-bold shadow-xs ${className}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-white" />
          Desligamento
        </Badge>
      );
  }
}
