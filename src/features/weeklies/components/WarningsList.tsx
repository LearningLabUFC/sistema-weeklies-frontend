import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FolderKanban,
  RefreshCw,
  ShieldAlert,
  User,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { warningsApi } from '@/features/weeklies/api/warningsApi';
import { WeeklyPagination } from '@/features/weeklies/components/Pagination';
import { WarningBadge } from '@/features/weeklies/components/WarningBadge';
import {
  formatDateCivil,
  formatTimestampFortaleza,
} from '@/features/weeklies/utils/dateUtils';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import type { WeeklyWarningListResponse } from '@/types/weeklies';

interface WarningsListProps {
  mode: 'me' | 'sector';
  sectorId?: string;
}

export function WarningsList({ mode, sectorId }: WarningsListProps) {
  const [pagina, setPagina] = useState(1);
  const limite = 10;

  const fetchWarnings =
    useCallback(async (): Promise<WeeklyWarningListResponse> => {
      if (mode === 'sector') {
        if (!sectorId) throw new Error('Setor não informado.');
        return warningsApi.getSectorWarnings(sectorId, { pagina, limite });
      }
      return warningsApi.getMyWarnings({ pagina, limite });
    }, [mode, sectorId, pagina, limite]);

  const { data, isLoading, error, refetch } = useAsyncQuery(fetchWarnings);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / limite)) : 1;

  return (
    <div className="space-y-4" data-testid="warnings-list">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">
            {mode === 'sector'
              ? 'Advertências de Membros do Setor (A02)'
              : 'Minhas Advertências (A01)'}
          </h3>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-xs h-8 gap-1.5"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
          />
          <span>Atualizar</span>
        </Button>
      </div>

      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Spinner className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm">Carregando advertências...</p>
        </div>
      )}

      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Erro ao carregar advertências</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && data && (
        <>
          {data.advertencias.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed rounded-2xl p-6 border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-semibold text-sm text-foreground">
                Nenhuma advertência registrada
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {mode === 'sector'
                  ? 'Não há advertências emitidas para membros deste setor.'
                  : 'Parabéns! Você não possui nenhuma advertência ou notificação de ausência.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.advertencias.map(warning => (
                <Card
                  key={warning.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <WarningBadge tipo={warning.tipo} />
                        <span className="text-xs font-semibold text-foreground">
                          {warning.semanas_ausentes}{' '}
                          {warning.semanas_ausentes === 1
                            ? 'ausência consecutiva'
                            : 'ausências consecutivas'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {mode === 'sector' && (
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {warning.usuario_nome ||
                              `ID: ${warning.usuario_id}`}
                          </span>
                        )}

                        {warning.setor_nome && (
                          <span className="flex items-center gap-1">
                            <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                            {warning.setor_nome}
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Semana: {formatDateCivil(warning.semana_referencia)}
                        </span>

                        <span>
                          • Emitida em:{' '}
                          {formatTimestampFortaleza(warning.criado_em)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <WeeklyPagination
            currentPage={pagina}
            totalPages={totalPages}
            onPageChange={setPagina}
          />
        </>
      )}
    </div>
  );
}
