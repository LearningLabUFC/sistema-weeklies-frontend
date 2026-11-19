import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Hourglass,
  Info,
  Layers,
  Pause as PauseIcon,
  Play,
  PlusCircle,
  RotateCcw,
  Square,
  Timer as TimerIcon,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  CardDescription,
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
import { Spinner } from '@/components/ui/spinner';
import {
  formatDate,
  formatSecondsToHMS,
  formatTime,
  useWorkSession,
} from '@/features/workSession/hooks/useWorkSession';
import { cn } from '@/lib/utils';
import type { WorkSessionDetail } from '@/types/workSession';

interface TimeClockTrackerProps {
  onSessionEnded?: (session: WorkSessionDetail | null) => void;
}

export const TimeClockTracker = ({
  onSessionEnded,
}: TimeClockTrackerProps = {}) => {
  const {
    session,
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
    isNearExpiration,
    handleStartSession,
    handleTogglePause,
    handleEndSession,
    handleContinueSession,
  } = useWorkSession({ onSessionEnded });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 text-muted-foreground">
        <Spinner className="size-8 animate-spin text-primary" />
        <span className="text-sm font-medium">
          Carregando informações da sessão...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Mensagem de Feedback / Alertas */}
      {feedback && (
        <Alert
          variant={feedback.type === 'error' ? 'destructive' : 'default'}
          className={
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
              : feedback.type === 'info'
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-950 dark:text-blue-200'
                : ''
          }
        >
          {feedback.type === 'error' && <AlertCircle className="size-4" />}
          {feedback.type === 'success' && <CheckCircle2 className="size-4" />}
          {feedback.type === 'info' && <Info className="size-4" />}
          {feedback.title && <AlertTitle>{feedback.title}</AlertTitle>}
          <AlertDescription>{feedback.description}</AlertDescription>
        </Alert>
      )}

      {/* Card Principal do Ponto */}
      <Card className="border-border/60 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 via-primary to-primary/40" />

        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="size-5 text-muted-foreground" />
              Registro de Ponto
            </CardTitle>
            <CardDescription className="capitalize">
              {formatDate(session?.entrada_em || new Date().toISOString())}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {hasOpenSession && currentSectorName && (
              <Badge
                variant="outline"
                className="font-medium bg-muted/60 border-primary/20 text-foreground flex items-center gap-1"
              >
                <Layers className="size-3 text-primary" />
                {currentSectorName}
              </Badge>
            )}
            {isSessionActive && (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 font-semibold animate-pulse">
                <span className="size-2 rounded-full bg-emerald-500 mr-1.5 inline-block" />
                Em andamento (ATIVA)
              </Badge>
            )}
            {isSessionPaused && (
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-3 py-1 font-semibold">
                <Coffee className="size-3.5 mr-1" />
                Em Intervalo (EM_PAUSA)
              </Badge>
            )}
            {!hasOpenSession && (
              <Badge variant="outline" className="text-muted-foreground">
                Sem sessão aberta
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center py-8 gap-8">
          {/* Cronômetro */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
              <TimerIcon className="size-4" />
              Tempo Trabalhado
            </span>
            <div
              className={`font-mono text-5xl sm:text-6xl font-bold tracking-tight transition-colors duration-300 ${
                isSessionPaused
                  ? 'text-amber-600 dark:text-amber-400'
                  : isSessionActive
                    ? 'text-primary'
                    : 'text-muted-foreground/60'
              }`}
            >
              {formatSecondsToHMS(seconds)}
            </div>

            {isSessionPaused && (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                <PauseIcon className="size-3" /> Cronômetro congelado no
                intervalo
              </span>
            )}
          </div>

          {/* Seletor de Setor (somente quando não houver sessão aberta) */}
          {!hasOpenSession && (
            <div className="w-full max-w-xs flex flex-col gap-1.5">
              <label
                htmlFor="sector-select"
                className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
              >
                <Layers className="size-3.5 text-primary" />
                Setor de Atuação
              </label>
              {activeSectors.length > 0 ? (
                <Select
                  value={selectedSectorId}
                  onValueChange={setUserSelectedSectorId}
                  disabled={isActionLoading}
                >
                  <SelectTrigger id="sector-select" className="w-full h-10">
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
              ) : (
                <div className="p-3 border rounded-lg bg-muted/40 text-xs text-muted-foreground text-center">
                  Você não está vinculado a nenhum setor ativo no momento.
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            {/* Botão Iniciar (Entrada) */}
            <Button
              size="lg"
              onClick={handleStartSession}
              disabled={
                hasOpenSession ||
                isActionLoading ||
                !selectedSectorId ||
                activeSectors.length === 0
              }
              className="flex-1 min-w-[130px] font-semibold h-11"
            >
              {isActionLoading && !hasOpenSession ? (
                <Spinner className="mr-2" />
              ) : (
                <Play className="size-4 mr-2 fill-current" />
              )}
              Iniciar
            </Button>

            {/* Botão Pausar / Retomar */}
            <Button
              size="lg"
              variant={isSessionPaused ? 'default' : 'outline'}
              onClick={handleTogglePause}
              disabled={!hasOpenSession || isActionLoading}
              className={`flex-1 min-w-[130px] font-semibold h-11 transition-all ${
                isSessionPaused
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : ''
              }`}
            >
              {isActionLoading && hasOpenSession ? (
                <Spinner className="mr-2" />
              ) : isSessionPaused ? (
                <>
                  <RotateCcw className="size-4 mr-2" />
                  Retomar
                </>
              ) : (
                <>
                  <PauseIcon className="size-4 mr-2" />
                  Pausar
                </>
              )}
            </Button>

            {/* Botão Terminar (Saída) com Dialog de Confirmação */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  variant="destructive"
                  disabled={!hasOpenSession || isActionLoading}
                  className="flex-1 min-w-[130px] font-semibold h-11"
                >
                  <Square className="size-4 mr-2 fill-current" />
                  Terminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Registrar Saída</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja encerrar a sessão de trabalho
                    atual? O tempo total contabilizado será gravado e pausas
                    abertas serão encerradas.
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
          </div>
        </CardContent>
      </Card>

      {/* Painel de Detalhes da Sessão */}
      {hasOpenSession && session && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-medium flex items-center gap-1.5">
                <Layers className="size-3.5" />
                Setor
              </CardDescription>
              <CardTitle className="text-lg font-bold truncate">
                {currentSectorName || 'Setor vinculado'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              Horas contabilizadas para este setor
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-medium flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Início da Sessão
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {formatTime(session.entrada_em)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              Entrada registrada no sistema
            </CardContent>
          </Card>

          <Card
            className={cn(
              'border-border/60 transition-colors',
              isNearExpiration &&
                'border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10',
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs uppercase font-medium flex items-center gap-1.5">
                  <Hourglass className="size-3.5" />
                  Limite Automático
                </CardDescription>
                {isNearExpiration && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 px-1.5 py-0"
                  >
                    Expira em breve
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl font-bold">
                {formatTime(session.expira_em)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col gap-2">
              <div className="text-xs text-muted-foreground">
                Expiração automática (+2h)
              </div>
              <Button
                type="button"
                size="sm"
                variant={isNearExpiration ? 'default' : 'outline'}
                className="w-full text-xs font-semibold h-7"
                onClick={handleContinueSession}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <Spinner className="mr-1.5 size-3" />
                ) : (
                  <PlusCircle className="mr-1.5 size-3" />
                )}
                Prorrogar (+2h)
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-medium flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Término
              </CardDescription>
              <CardTitle className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                {session.saida_em ? (
                  formatTime(session.saida_em)
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    Em andamento
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              Horário do registro da saída
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico de Pausas da Sessão Atual */}
      {hasOpenSession && session && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Coffee className="size-4 text-muted-foreground" />
              Intervalos na Sessão Atual
            </CardTitle>
            <CardDescription>
              Registro de todas as pausas efetuadas nesta jornada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session.pausas && session.pausas.length > 0 ? (
              <div className="divide-y divide-border/50">
                {session.pausas.map((pausa, idx) => (
                  <div
                    key={pausa.id || idx}
                    className="py-2.5 flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="font-medium">Pausa #{idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-muted-foreground">
                        Início: {formatTime(pausa.inicio_em)}
                      </span>
                      <span>—</span>
                      {pausa.fim_em ? (
                        <span className="text-muted-foreground">
                          Fim: {formatTime(pausa.fim_em)}
                        </span>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-2"
                        >
                          Em aberto
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-3 text-center border border-dashed rounded-lg">
                Nenhum intervalo realizado nesta sessão.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
