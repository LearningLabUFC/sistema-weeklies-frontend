import {
  AlertCircle,
  ArrowRight,
  Clock,
  Coffee,
  Layers,
  Pause as PauseIcon,
  Play,
  RotateCcw,
  Square,
} from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import {
  formatDurationSummary,
  formatSecondsToHMS,
  getWeekRange,
  useWorkSession,
} from '@/features/workSession/hooks/useWorkSession';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useAuth } from '@/hooks/useAuth';
import { workSessionService } from '@/services/workSessionService';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '---';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(isoString?: string | null): string {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSessionDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  if (safe < 60) return `${safe}s`;
  return formatDurationSummary(safe);
}

export function QuickTimeClockCard() {
  const { user } = useAuth();
  const userId = user?.id;
  const { sectors } = useSectorContext();

  const fetchWeeklySummary = useCallback(async () => {
    const range = getWeekRange();
    return workSessionService.getSummary({
      inicio: range.inicio,
      fim: range.fim,
      ...(userId ? { usuario_id: userId } : {}),
    });
  }, [userId]);

  const {
    data: weeklySummary,
    isLoading: isLoadingSummary,
    refetch: refetchWeeklySummary,
  } = useAsyncQuery(fetchWeeklySummary);

  const fetchRecentHistory = useCallback(async () => {
    return workSessionService.getHistory({
      limite: 4,
      pagina: 1,
      ...(userId ? { usuario_id: userId } : {}),
    });
  }, [userId]);

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useAsyncQuery(fetchRecentHistory);

  const weeklySeconds = weeklySummary?.tempo_trabalhado_segundos ?? 0;

  const {
    isLoading,
    isActionLoading,
    feedback,
    seconds,
    setUserSelectedSectorId,
    activeSectors,
    selectedSectorId,
    currentSectorName,
    isSessionActive,
    isSessionPaused,
    hasOpenSession,
    handleStartSession,
    handleTogglePause,
    handleEndSession,
  } = useWorkSession({
    onSessionEnded: () => {
      void refetchWeeklySummary();
      void refetchHistory();
    },
  });

  const recentSessions = useMemo(() => {
    if (!historyData?.sessoes) return [];
    return historyData.sessoes
      .filter(s => s.status === 'FINALIZADA' || s.status === 'EXPIRADA_SISTEMA')
      .slice(0, 2);
  }, [historyData]);

  const getSectorName = useCallback(
    (sectorId: string) => {
      const found = sectors.find(s => s.id === sectorId);
      return found?.nome || 'Setor';
    },
    [sectors],
  );

  const weeklyGoalHours = user?.meta_horas_semanais ?? 12;
  const weeklyGoalSeconds = Math.max(1, weeklyGoalHours * 3600);
  const progressPercentage = Math.min(
    100,
    Math.round((weeklySeconds / weeklyGoalSeconds) * 100),
  );

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
              Controle de Horas
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ponto rápido e carga semanal
            </p>
          </div>
        </div>

        <div>
          {isSessionActive && (
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 mr-1.5 inline-block animate-pulse" />
              Em turno
            </Badge>
          )}
          {isSessionPaused && (
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold">
              <Coffee className="size-3 mr-1" />
              Em pausa
            </Badge>
          )}
          {!hasOpenSession && (
            <Badge variant="outline" className="text-muted-foreground">
              Fora de turno
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5 flex-1">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-40 mx-auto" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            {feedback?.type === 'error' && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback.description}</span>
              </div>
            )}

            <div className="flex flex-col items-center justify-center py-2 text-center space-y-1.5">
              <span
                data-testid="quick-clock-timer"
                className={`font-mono text-4xl font-bold tracking-tight ${
                  isSessionPaused
                    ? 'text-amber-600 dark:text-amber-400'
                    : isSessionActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {formatSecondsToHMS(seconds)}
              </span>

              {hasOpenSession && currentSectorName && (
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  {currentSectorName}
                </span>
              )}
            </div>

            {/* Seletor compacto de setor antes de iniciar se houver mais de 1 */}
            {!hasOpenSession && activeSectors.length > 1 && (
              <div className="space-y-1">
                <Select
                  value={selectedSectorId}
                  onValueChange={setUserSelectedSectorId}
                  disabled={isActionLoading}
                >
                  <SelectTrigger
                    aria-label="Setor do ponto"
                    className="h-9 text-xs"
                  >
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSectors.map(sec => (
                      <SelectItem key={sec.id} value={sec.id}>
                        {sec.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!hasOpenSession && activeSectors.length === 0 && (
              <p className="text-xs text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5">
                Vincule-se a um setor ativo para iniciar o ponto.
              </p>
            )}

            {/* Botões de ação */}
            <div className="flex flex-wrap items-center gap-2">
              {!hasOpenSession ? (
                <Button
                  type="button"
                  onClick={handleStartSession}
                  disabled={
                    isActionLoading ||
                    !selectedSectorId ||
                    activeSectors.length === 0
                  }
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {isActionLoading ? (
                    <Spinner className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                  Iniciar ponto
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant={isSessionPaused ? 'default' : 'outline'}
                    onClick={handleTogglePause}
                    disabled={isActionLoading}
                    className={`flex-1 gap-1.5 font-semibold ${
                      isSessionPaused
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : ''
                    }`}
                  >
                    {isActionLoading ? (
                      <Spinner className="w-4 h-4" />
                    ) : isSessionPaused ? (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Retomar
                      </>
                    ) : (
                      <>
                        <PauseIcon className="w-4 h-4" />
                        Pausar
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isActionLoading}
                        className="flex-1 gap-1.5 font-semibold"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        Encerrar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Registrar Saída</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza de que deseja encerrar a sessão de
                          trabalho atual? O tempo total contabilizado será
                          gravado e pausas abertas serão encerradas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleEndSession}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Confirmar Saída
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>

            {/* Resumo semanal e barra de meta */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Esta semana:{' '}
                  <strong className="text-slate-900 dark:text-slate-100">
                    {isLoadingSummary
                      ? '...'
                      : formatDurationSummary(weeklySeconds)}
                  </strong>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Meta: {weeklyGoalHours}h ({progressPercentage}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Pontos recentes (2 anteriores) */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pontos recentes
              </p>
              {isLoadingHistory ? (
                <div className="space-y-2">
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nenhum ponto registrado anteriormente
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  {recentSessions.map(session => (
                    <div
                      key={session.id}
                      data-testid="recent-clock-session"
                      className="px-3.5 py-2.5 flex items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/50"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {formatDate(session.entrada_em)}
                          </span>
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {getSectorName(session.setor_id)}
                          </span>
                          {session.status === 'EXPIRADA_SISTEMA' && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 px-1.5 py-0"
                            >
                              Expirada (8h)
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatTime(session.entrada_em)} às{' '}
                          {session.saida_em
                            ? formatTime(session.saida_em)
                            : 'Em aberto'}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className="text-[11px] font-semibold bg-white dark:bg-slate-800 shrink-0 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      >
                        {formatSessionDuration(
                          session.tempo_trabalhado_segundos,
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="border-t border-slate-100 dark:border-slate-800 px-5 py-3 bg-slate-50/50 dark:bg-slate-900/40">
        <Link
          to="/controle-horas"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center gap-1"
        >
          Abrir controle de horas
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
