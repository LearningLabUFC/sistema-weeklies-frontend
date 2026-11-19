import { AlertTriangle, ArrowRight, Eye, FileText, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { isRejeitadaWithinGracePeriod } from '@/features/weeklies/utils/dateUtils';
import type { WeeklyResponse } from '@/types/weeklies';

export interface WeeklyStatusCtaProps {
  weekly: WeeklyResponse | null;
  notFound: boolean;
  isLoading?: boolean;
  isCreating?: boolean;
  onCreate?: () => void;
  onNavigateToEditor: () => void;
  onViewSummary?: () => void;
}

/**
 * Botão de chamada à ação contextual baseado no ciclo de vida atual da weekly.
 */
export function WeeklyStatusCta({
  weekly,
  notFound,
  isLoading = false,
  isCreating = false,
  onCreate,
  onNavigateToEditor,
  onViewSummary,
}: WeeklyStatusCtaProps) {
  if (isLoading) {
    return (
      <Button disabled className="gap-2">
        <Spinner className="w-4 h-4" />
        Carregando...
      </Button>
    );
  }

  if (notFound || !weekly) {
    return (
      <Button
        type="button"
        onClick={onCreate ?? onNavigateToEditor}
        disabled={isCreating}
        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {isCreating ? (
          <Spinner className="w-4 h-4" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Criar weekly da semana
      </Button>
    );
  }

  if (weekly.status === 'RASCUNHO') {
    return (
      <Button
        type="button"
        onClick={onNavigateToEditor}
        className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        Continuar editando
        <ArrowRight className="w-4 h-4" />
      </Button>
    );
  }

  if (
    weekly.status === 'REJEITADA' &&
    isRejeitadaWithinGracePeriod(weekly.avaliada_em)
  ) {
    return (
      <Button
        type="button"
        onClick={onNavigateToEditor}
        className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
      >
        <AlertTriangle className="w-4 h-4" />
        Corrigir e reenviar
      </Button>
    );
  }

  if (weekly.status === 'ENVIADA' || weekly.status === 'APROVADA') {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={onViewSummary ?? onNavigateToEditor}
        className="gap-2"
      >
        <Eye className="w-4 h-4" />
        Visualizar weekly
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onViewSummary ?? onNavigateToEditor}
      className="gap-2"
    >
      <FileText className="w-4 h-4" />
      Ver detalhes
    </Button>
  );
}
