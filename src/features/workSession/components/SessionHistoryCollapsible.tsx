import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Clock,
  Filter,
  History,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { workSessionService } from '@/services/workSessionService';
import type { WorkSession, WorkSessionStatus } from '@/types/workSession';

/**
 * Formata segundos no formato HH:MM:SS ou Xh Ym
 */
function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Formata horário local (HH:mm)
 */
function formatTime(isoString?: string | null): string {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata data legível (DD/MM/AAAA)
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '---';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formata data local para input type="date" (YYYY-MM-DD)
 */
function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna as datas de início e fim da semana corrente (YYYY-MM-DD)
 */
function getCurrentWeekDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: toDateInputValue(monday),
    endDate: toDateInputValue(sunday),
  };
}

/**
 * Retorna as datas de início e fim do mês corrente (YYYY-MM-DD)
 */
function getCurrentMonthDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: toDateInputValue(firstDay),
    endDate: toDateInputValue(lastDay),
  };
}

/**
 * Converte data de input (YYYY-MM-DD) para ISO com fuso (início ou fim do dia)
 */
function toIsoBoundary(dateStr: string, isEndOfDay: boolean = false): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(
    year,
    month - 1,
    day,
    isEndOfDay ? 23 : 0,
    isEndOfDay ? 59 : 0,
    isEndOfDay ? 59 : 0,
    isEndOfDay ? 999 : 0,
  );
  return date.toISOString();
}

/**
 * Badge correspondente ao status da sessão
 */
function StatusBadge({ status }: { status: WorkSessionStatus }) {
  switch (status) {
    case 'FINALIZADA':
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
        >
          Finalizada
        </Badge>
      );
    case 'ATIVA':
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
          Ativa
        </Badge>
      );
    case 'EM_PAUSA':
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
          Em Pausa
        </Badge>
      );
    case 'EXPIRADA_SISTEMA':
      return (
        <Badge
          variant="secondary"
          className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20"
        >
          Expirada (8h)
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface SessionHistoryCollapsibleProps {
  refreshTrigger?: number;
}

type QuickFilter = 'all' | 'week' | 'month' | 'custom';

export const SessionHistoryCollapsible = ({
  refreshTrigger = 0,
}: SessionHistoryCollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros de data
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Limite inferior (Maio de 2020) e superior dinâmico (data atual)
  const MIN_DATE = '2020-05-01';
  const maxDate = toDateInputValue(new Date());

  const fetchHistory = useCallback(
    async (overrideStart?: string, overrideEnd?: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const currentStart =
          overrideStart !== undefined ? overrideStart : startDate;
        const currentEnd = overrideEnd !== undefined ? overrideEnd : endDate;

        const params: { inicio?: string; fim?: string } = {};

        // No contrato da API, início e fim no histórico devem ser enviados juntos
        if (currentStart && currentEnd) {
          if (new Date(currentStart) > new Date(currentEnd)) {
            setError('A data inicial deve ser anterior ou igual à data final.');
            setIsLoading(false);
            return;
          }
          params.inicio = toIsoBoundary(currentStart, false);
          params.fim = toIsoBoundary(currentEnd, true);
        }

        const data = await workSessionService.getHistory(params);
        // Ordena pelas mais recentes primeiro
        const sorted = (data.sessoes || []).sort(
          (a, b) =>
            new Date(b.entrada_em).getTime() - new Date(a.entrada_em).getTime(),
        );
        setSessions(sorted);
        setHasLoaded(true);
      } catch (err: unknown) {
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || 'Não foi possível carregar o histórico de sessões.';
        setError(detail);
      } finally {
        setIsLoading(false);
      }
    },
    [startDate, endDate],
  );

  // Sincronização reativa quando uma nova sessão é finalizada
  useEffect(() => {
    let isMounted = true;

    if (refreshTrigger > 0 && isOpen) {
      const reload = async () => {
        if (isMounted) {
          await fetchHistory();
        }
      };
      reload();
    }

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, isOpen, fetchHistory]);

  const handleToggle = () => {
    const nextState = !isOpen;

    setIsOpen(nextState);

    // Carrega sob demanda na primeira abertura
    if (nextState && !hasLoaded) {
      fetchHistory();
    }
  };

  // Seletores rápidos de filtro
  const handleSelectQuickFilter = (type: QuickFilter) => {
    setQuickFilter(type);
    setError(null);

    if (type === 'all') {
      setStartDate('');
      setEndDate('');
      fetchHistory('', '');
    } else if (type === 'week') {
      const range = getCurrentWeekDateRange();
      setStartDate(range.startDate);
      setEndDate(range.endDate);
      fetchHistory(range.startDate, range.endDate);
    } else if (type === 'month') {
      const range = getCurrentMonthDateRange();
      setStartDate(range.startDate);
      setEndDate(range.endDate);
      fetchHistory(range.startDate, range.endDate);
    }
  };

  const handleApplyCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Por favor, preencha ambas as datas para filtrar.');
      return;
    }
    setQuickFilter('custom');
    fetchHistory();
  };

  const handleClearFilter = () => {
    handleSelectQuickFilter('all');
  };

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
              Histórico de Sessões
            </span>
            {hasLoaded && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {sessions.length}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-5" />
          </div>
        </button>

        {/* Conteúdo Expandível */}
        {isOpen && (
          <CardContent className="p-4 sm:p-6 pt-3 border-t border-border/40 animate-in fade-in-50 duration-300">
            {/* Barra de Filtros por Período */}
            <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Filter className="size-3.5" />
                  Filtrar por Período
                </span>

                {/* Filtros Rápidos (Semana / Mês / Todas) */}
                <div className="inline-flex rounded-lg bg-muted p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectQuickFilter('all')}
                    className={`px-3 py-1 font-medium rounded-md transition-all ${
                      quickFilter === 'all'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickFilter('week')}
                    className={`px-3 py-1 font-medium rounded-md transition-all ${
                      quickFilter === 'week'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Esta Semana
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickFilter('month')}
                    className={`px-3 py-1 font-medium rounded-md transition-all ${
                      quickFilter === 'month'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Este Mês
                  </button>
                </div>
              </div>

              {/* Inputs de Data Personalizada */}
              <form
                onSubmit={handleApplyCustomFilter}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end pt-1"
              >
                <div className="sm:col-span-5 space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" /> De
                  </label>
                  <Input
                    type="date"
                    min={MIN_DATE}
                    max={endDate || maxDate}
                    value={startDate}
                    onChange={e => {
                      setStartDate(e.target.value);
                      setQuickFilter('custom');
                    }}
                    className="h-8 text-xs bg-background"
                  />
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" /> Até
                  </label>
                  <Input
                    type="date"
                    min={startDate || MIN_DATE}
                    max={maxDate}
                    value={endDate}
                    onChange={e => {
                      setEndDate(e.target.value);
                      setQuickFilter('custom');
                    }}
                    className="h-8 text-xs bg-background"
                  />
                </div>

                <div className="sm:col-span-2 flex gap-1.5">
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 flex-1 text-xs font-semibold"
                    disabled={isLoading || !startDate || !endDate}
                  >
                    Filtrar
                  </Button>
                  {(startDate || endDate || quickFilter !== 'all') && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilter}
                      className="h-8 px-2 text-xs"
                      title="Limpar filtros"
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Listagem do Histórico */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                <Spinner className="size-6 animate-spin text-primary" />
                <span className="text-sm font-medium">
                  Carregando histórico...
                </span>
              </div>
            ) : error ? (
              <div className="py-4 space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchHistory()}
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <History className="size-8 text-muted-foreground/50 stroke-1" />
                <p className="text-sm font-medium text-foreground">
                  Nenhuma sessão encontrada para este período
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {quickFilter !== 'all'
                    ? 'Tente selecionar outro intervalo de datas ou limpar o filtro.'
                    : 'Assim que você registrar e encerrar suas jornadas de trabalho, elas serão exibidas aqui.'}
                </p>
                {quickFilter !== 'all' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilter}
                    className="mt-2 text-xs"
                  >
                    Ver todas as sessões
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm hover:bg-muted/20 px-2 rounded-lg transition-colors"
                  >
                    {/* Data e Período */}
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="p-2 rounded-md bg-muted/60 text-muted-foreground shrink-0 mt-0.5 sm:mt-0">
                        <Calendar className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          <span>{formatDate(s.entrada_em)}</span>
                          <StatusBadge status={s.status} />
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>
                            {formatTime(s.entrada_em)} às{' '}
                            {s.saida_em ? formatTime(s.saida_em) : 'Em aberto'}
                          </span>
                          {s.motivo_encerramento && (
                            <>
                              <span>•</span>
                              <span>
                                {s.motivo_encerramento === 'MANUAL'
                                  ? 'Saída manual'
                                  : 'Limite atingido'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Duração Trabalhada */}
                    <div className="flex items-center gap-2 self-end sm:self-auto pl-11 sm:pl-0">
                      <div className="flex items-center gap-1.5 font-mono text-sm font-semibold bg-muted/40 px-2.5 py-1 rounded-md">
                        <Timer className="size-3.5 text-muted-foreground" />
                        <span>
                          {formatDuration(s.tempo_trabalhado_segundos)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
