import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FileText,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { workSessionService } from '@/services/workSessionService';
import type { WorkSessionSummaryResponse } from '@/types/workSession';

/**
 * Formata segundos no formato Xh Ym
 */
function formatDurationSummary(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours === 0 && minutes === 0) {
    return '0h 00m';
  }
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

/**
 * Retorna os limites (ISO 8601 UTC) do início e fim da semana corrente (de domingo ou segunda até domingo)
 */
function getWeekRange(): { inicio: string; fim: string; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda...

  // Ajuste para início na segunda-feira
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const formatShortDate = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  return {
    inicio: monday.toISOString(),
    fim: sunday.toISOString(),
    label: `Semana Atual (${formatShortDate(monday)} a ${formatShortDate(sunday)})`,
  };
}

/**
 * Retorna os limites (ISO 8601 UTC) do mês corrente
 */
function getMonthRange(): { inicio: string; fim: string; label: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const lastDay = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const monthName = now.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return {
    inicio: firstDay.toISOString(),
    fim: lastDay.toISOString(),
    label: `Mês Atual (${monthName})`,
  };
}

interface SessionSummaryCollapsibleProps {
  refreshTrigger?: number;
}

export const SessionSummaryCollapsible = ({
  refreshTrigger = 0,
}: SessionSummaryCollapsibleProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [periodType, setPeriodType] = useState<'week' | 'month'>('week');
  const [summary, setSummary] = useState<WorkSessionSummaryResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRange = useMemo(() => {
    return periodType === 'week' ? getWeekRange() : getMonthRange();
  }, [periodType]);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const range = periodType === 'week' ? getWeekRange() : getMonthRange();
      const data = await workSessionService.getSummary({
        inicio: range.inicio,
        fim: range.fim,
      });
      setSummary(data);
      setHasLoaded(true);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Não foi possível carregar o resumo de horas.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  }, [periodType]);

  // Carrega ao mudar o tipo de período ou quando refreshTrigger for acionado
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const range = periodType === 'week' ? getWeekRange() : getMonthRange();
        const data = await workSessionService.getSummary({
          inicio: range.inicio,
          fim: range.fim,
        });
        if (!isMounted) return;
        setSummary(data);
        setHasLoaded(true);
      } catch (err: unknown) {
        if (!isMounted) return;
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || 'Não foi possível carregar o resumo de horas.';
        setError(detail);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, periodType, refreshTrigger]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
  };

  // Cálculo de progresso da meta semanal do usuário (se aplicável)

  const metaHoras = user?.meta_horas_semanais || 0;
  const metaSegundos = metaHoras * 3600;
  const totalSegundos = summary?.tempo_trabalhado_segundos || 0;
  const porcentagemMeta =
    metaSegundos > 0
      ? Math.min(100, Math.round((totalSegundos / metaSegundos) * 100))
      : 0;

  return (
    <div className="w-full mt-4">
      <Card className="border-border/60 shadow-xs overflow-hidden transition-all duration-300">
        {/* Barra de Controle (Gatilho) */}
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center justify-between p-4 sm:px-6 hover:bg-muted/40 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2.5">
            <ChevronDown
              className={`size-4.5 text-muted-foreground transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
            <span className="font-semibold text-base text-foreground tracking-tight">
              Resumo de Horas
            </span>
            {hasLoaded && summary && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20"
              >
                {formatDurationSummary(summary.tempo_trabalhado_segundos)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="size-5" />
          </div>
        </button>

        {/* Conteúdo Expandível */}
        {isOpen && (
          <CardContent className="p-4 sm:p-6 pt-3 border-t border-border/40 animate-in fade-in-50 duration-300">
            {/* Seletor de Período (Semana / Mês) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {currentRange.label}
              </span>

              <div className="inline-flex rounded-lg bg-muted p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPeriodType('week')}
                  className={`px-3 py-1 font-medium rounded-md transition-all ${
                    periodType === 'week'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Esta Semana
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodType('month')}
                  className={`px-3 py-1 font-medium rounded-md transition-all ${
                    periodType === 'month'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Este Mês
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                <Spinner className="size-6 animate-spin text-primary" />
                <span className="text-sm font-medium">
                  Calculando resumo de horas...
                </span>
              </div>
            ) : error ? (
              <div className="py-4 space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={fetchSummary}>
                    Tentar novamente
                  </Button>
                </div>
              </div>
            ) : summary ? (
              <div className="space-y-4">
                {/* Cards de Métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-3.5">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <Timer className="size-5" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">
                        Tempo Trabalhado
                      </span>
                      <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
                        {formatDurationSummary(
                          summary.tempo_trabalhado_segundos,
                        )}
                      </p>
                    </div>
                  </div>

                  {periodType === 'week' && metaHoras > 0 ? (
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-3.5">
                      <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Target className="size-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">
                            Meta Semanal
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {porcentagemMeta}%
                          </span>
                        </div>
                        <p className="font-mono text-lg font-bold tracking-tight text-foreground">
                          {formatDurationSummary(
                            summary.tempo_trabalhado_segundos,
                          )}{' '}
                          <span className="text-xs font-normal text-muted-foreground">
                            / {metaHoras}h
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-3.5">
                      <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <TrendingUp className="size-5" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-medium">
                          Total em Horas Decimais
                        </span>
                        <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
                          {(summary.tempo_trabalhado_segundos / 3600).toFixed(
                            1,
                          )}
                          h
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra de Progresso da Meta Semanal */}
                {periodType === 'week' && metaHoras > 0 && (
                  <div className="p-3.5 rounded-lg bg-muted/20 border border-border/40 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progresso da meta semanal</span>
                      <span className="font-medium text-foreground">
                        {porcentagemMeta >= 100 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="size-3.5" /> Meta atingida!
                          </span>
                        ) : (
                          `${porcentagemMeta}% concluído`
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${porcentagemMeta}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
