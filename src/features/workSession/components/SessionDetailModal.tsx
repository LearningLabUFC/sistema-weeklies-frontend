import {
  AlertCircle,
  Calendar,
  Clock,
  Coffee,
  Layers,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { SectorContext } from '@/features/sectors/context/sectorContextDef';
import { workSessionService } from '@/services/workSessionService';
import type { WorkSessionDetail, WorkSessionStatus } from '@/types/workSession';

interface SessionDetailModalProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

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
 * Formata data legível completa
 */
function formatDate(isoString?: string | null): string {
  if (!isoString) return '---';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '---';
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Badge de status da sessão
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

export const SessionDetailModal = ({
  sessionId,
  isOpen,
  onClose,
}: SessionDetailModalProps) => {
  const sectorContext = useContext(SectorContext);
  const sectors = sectorContext?.sectors ?? [];
  const mySectors = sectorContext?.mySectors ?? [];
  const [detail, setDetail] = useState<WorkSessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await workSessionService.getSessionById(id);
      setDetail(data);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Não foi possível carregar os detalhes da sessão.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !sessionId) {
      return;
    }

    let isMounted = true;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await workSessionService.getSessionById(sessionId);
        if (isMounted) {
          setDetail(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMsg =
            (err as { response?: { data?: { detail?: string } } })?.response
              ?.data?.detail ||
            'Não foi possível carregar os detalhes da sessão.';
          setError(errorMsg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [isOpen, sessionId]);

  const sectorName = detail?.setor_id
    ? mySectors.find(s => s.id === detail.setor_id)?.nome ||
      sectors.find(s => s.id === detail.setor_id)?.nome ||
      'Setor vinculado'
    : 'Setor Geral';

  // Tempo total somado de pausas concluídas
  const totalPauseSeconds =
    detail?.pausas && detail.pausas.length > 0
      ? detail.pausas.reduce((acc, p) => {
          if (!p.fim_em) return acc;
          const inicio = new Date(p.inicio_em).getTime();
          const fim = new Date(p.fim_em).getTime();
          if (!isNaN(inicio) && fim > inicio) {
            return acc + Math.floor((fim - inicio) / 1000);
          }
          return acc;
        }, 0)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Detalhes da Sessão
            </DialogTitle>
            {detail && <StatusBadge status={detail.status} />}
          </div>
          <DialogDescription className="capitalize">
            {formatDate(detail?.entrada_em)}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Spinner className="size-7 animate-spin text-primary" />
            <span className="text-sm font-medium">
              Buscando detalhes da sessão...
            </span>
          </div>
        ) : error ? (
          <div className="py-4 space-y-3">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sessionId && loadDetail(sessionId)}
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : detail ? (
          <div className="space-y-5 py-2">
            {/* Grid de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="border-border/60 bg-muted/20">
                <CardContent className="p-3.5 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Layers className="size-3.5 text-primary" />
                    Setor
                  </span>
                  <span className="text-sm font-bold truncate">
                    {sectorName}
                  </span>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-muted/20">
                <CardContent className="p-3.5 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    Horário
                  </span>
                  <span className="text-sm font-bold">
                    {formatTime(detail.entrada_em)} às{' '}
                    {detail.saida_em
                      ? formatTime(detail.saida_em)
                      : 'Em aberto'}
                  </span>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-muted/20">
                <CardContent className="p-3.5 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Timer className="size-3.5 text-primary" />
                    Tempo Total
                  </span>
                  <span className="text-sm font-bold font-mono text-primary">
                    {formatDuration(detail.tempo_trabalhado_segundos)}
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Motivo de Encerramento */}
            {detail.motivo_encerramento && (
              <div className="px-3.5 py-2 rounded-lg border border-border/50 bg-muted/10 text-xs flex items-center justify-between">
                <span className="text-muted-foreground font-medium">
                  Motivo de encerramento:
                </span>
                <span className="font-semibold">
                  {detail.motivo_encerramento === 'MANUAL'
                    ? 'Saída manual registrada'
                    : 'Limite de 8h atingido (automático)'}
                </span>
              </div>
            )}

            {/* Seção de Pausas / Intervalos */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Coffee className="size-4 text-muted-foreground" />
                  Intervalos Realizados ({detail.pausas?.length || 0})
                </span>
                {totalPauseSeconds > 0 && (
                  <span className="text-xs text-muted-foreground font-mono">
                    Total em pausa: {formatDuration(totalPauseSeconds)}
                  </span>
                )}
              </div>

              {detail.pausas && detail.pausas.length > 0 ? (
                <div className="border border-border/60 rounded-lg divide-y divide-border/40 overflow-hidden">
                  {detail.pausas.map((pausa, idx) => {
                    const inicioMs = new Date(pausa.inicio_em).getTime();
                    const fimMs = pausa.fim_em
                      ? new Date(pausa.fim_em).getTime()
                      : null;
                    const duracaoSegundos =
                      fimMs && fimMs > inicioMs
                        ? Math.floor((fimMs - inicioMs) / 1000)
                        : null;

                    return (
                      <div
                        key={pausa.id || idx}
                        className="p-3 flex items-center justify-between text-xs hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <span className="font-medium">
                            Intervalo #{idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-muted-foreground">
                            {formatTime(pausa.inicio_em)} —{' '}
                            {pausa.fim_em
                              ? formatTime(pausa.fim_em)
                              : 'Em aberto'}
                          </span>
                          {duracaoSegundos !== null ? (
                            <Badge
                              variant="outline"
                              className="font-normal text-[10px] px-1.5 py-0"
                            >
                              {formatDuration(duracaoSegundos)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px] px-1.5 py-0"
                            >
                              Em aberto
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 border border-dashed rounded-lg text-xs text-muted-foreground text-center">
                  Nenhum intervalo foi registrado nesta jornada de trabalho.
                </div>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
