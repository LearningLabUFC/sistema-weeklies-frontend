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
import { useCallback } from 'react';
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
import {
  formatDurationSummary,
  formatSecondsToHMS,
  getWeekRange,
  useWorkSession,
} from '@/features/workSession/hooks/useWorkSession';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useAuth } from '@/hooks/useAuth';
import { workSessionService } from '@/services/workSessionService';

export function QuickTimeClockCard() {
  const { user } = useAuth();
  const userId = user?.id;

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
    },
  });

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
