import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { workSessionService } from '@/services/workSessionService';
import type { Pause, WorkSessionDetail } from '@/types/workSession';

export interface FeedbackMessage {
  type: 'error' | 'success' | 'info';
  title?: string;
  description: string;
}

/**
 * Formata segundos no formato HH:MM:SS
 */
export function formatSecondsToHMS(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
}

/**
 * Formata segundos no formato Xh Ym
 */
export function formatDurationSummary(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours === 0 && minutes === 0) {
    return '0h 00m';
  }
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

/**
 * Retorna os limites (ISO 8601 UTC) do início e fim da semana corrente (segunda a domingo).
 */
export function getWeekRange(): { inicio: string; fim: string; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda...

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
 * Formata ISO string em horário local (HH:mm)
 */
export function formatTime(isoString?: string | null): string {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata data completa legível
 */
export function formatDate(isoString?: string | null): string {
  if (!isoString) return '---';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '---';
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

/**
 * Calcula o tempo trabalhado em segundos com base nos registros locais
 */
export function computeWorkedSeconds(session: WorkSessionDetail): number {
  const entrada = new Date(session.entrada_em).getTime();
  const expira = new Date(session.expira_em).getTime();
  const saida = session.saida_em ? new Date(session.saida_em).getTime() : null;

  // Limite superior do cálculo: saída (se encerrada) ou agora (limitado à expiração)
  const agora = Date.now();
  const tempoFinal = saida ? saida : Math.min(agora, expira);

  if (isNaN(entrada) || tempoFinal <= entrada) return 0;

  // Soma de pausas
  let totalPausaMs = 0;
  if (session.pausas && session.pausas.length > 0) {
    for (const pausa of session.pausas) {
      const inicio = new Date(pausa.inicio_em).getTime();
      const fim = pausa.fim_em ? new Date(pausa.fim_em).getTime() : tempoFinal;
      if (!isNaN(inicio) && fim > inicio) {
        const pausaInicioValida = Math.max(entrada, inicio);
        const pausaFimValida = Math.min(tempoFinal, fim);
        if (pausaFimValida > pausaInicioValida) {
          totalPausaMs += pausaFimValida - pausaInicioValida;
        }
      }
    }
  }

  const liquidoMs = tempoFinal - entrada - totalPausaMs;
  return Math.max(0, Math.floor(liquidoMs / 1000));
}

export interface UseWorkSessionOptions {
  onSessionEnded?: (session: WorkSessionDetail | null) => void;
}

/**
 * Hook compartilhado para controlar o ciclo de vida do ponto (sessão de trabalho, pausas e cronômetro).
 */
export function useWorkSession({ onSessionEnded }: UseWorkSessionOptions = {}) {
  const {
    mySectors,
    sectors,
    selectedSectorId: contextSectorId,
  } = useSectorContext();

  const [session, setSession] = useState<WorkSessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [userSelectedSectorId, setUserSelectedSectorId] = useState<
    string | null
  >(null);

  const onSessionEndedRef = useRef(onSessionEnded);
  useEffect(() => {
    onSessionEndedRef.current = onSessionEnded;
  });

  // Setores ativos do usuário disponíveis para registrar ponto
  const activeSectors = useMemo(() => {
    return mySectors.filter(s => s.ativo !== false);
  }, [mySectors]);

  // Setor efetivo derivado: seleção manual válida, setor do contexto global ou primeiro ativo
  const selectedSectorId = useMemo(() => {
    if (
      userSelectedSectorId &&
      activeSectors.some(s => s.id === userSelectedSectorId)
    ) {
      return userSelectedSectorId;
    }
    if (contextSectorId && activeSectors.some(s => s.id === contextSectorId)) {
      return contextSectorId;
    }
    return activeSectors[0]?.id || '';
  }, [userSelectedSectorId, activeSectors, contextSectorId]);

  // Busca a sessão atual no backend
  const fetchCurrentSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const current = await workSessionService.getCurrentSession();
      setSession(current);

      if (current) {
        setSeconds(computeWorkedSeconds(current));
      } else {
        setSeconds(0);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Não foi possível carregar a sessão atual de ponto.';
      setFeedback({
        type: 'error',
        title: 'Erro ao carregar sessão',
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      if (isMounted) {
        await fetchCurrentSession();
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentSession]);

  // Cronômetro em tempo real
  useEffect(() => {
    if (!session || session.status !== 'ATIVA') return;

    const interval = setInterval(() => {
      setSeconds(computeWorkedSeconds(session));
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Relógio do componente para checagens temporais
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Encontra pausa em aberto se houver
  const openPause = useMemo<Pause | undefined>(() => {
    return session?.pausas?.find(p => !p.fim_em);
  }, [session]);

  // Nome do setor contabilizado na sessão atual
  const currentSectorName = useMemo(() => {
    if (!session?.setor_id) return null;
    const found =
      mySectors.find(s => s.id === session.setor_id) ||
      sectors.find(s => s.id === session.setor_id);
    return found?.nome || null;
  }, [session, mySectors, sectors]);

  const handleStartSession = useCallback(async () => {
    if (!selectedSectorId) {
      setFeedback({
        type: 'error',
        title: 'Setor obrigatório',
        description:
          'Selecione um setor ativo para iniciar a contagem de horas.',
      });
      return;
    }

    setFeedback(null);
    setIsActionLoading(true);
    try {
      const newSession =
        await workSessionService.startSession(selectedSectorId);
      setSession({
        ...newSession,
        pausas: [],
      });
      setSeconds(0);
      setFeedback({
        type: 'success',
        title: 'Entrada registrada com sucesso!',
        description: 'Sua jornada de trabalho foi iniciada.',
      });
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Erro ao registrar entrada.';
      setFeedback({
        type: 'error',
        title: 'Atenção',
        description: detail,
      });
      fetchCurrentSession();
    } finally {
      setIsActionLoading(false);
    }
  }, [selectedSectorId, fetchCurrentSession]);

  const handleTogglePause = useCallback(async () => {
    if (!session) return;
    setFeedback(null);
    setIsActionLoading(true);

    try {
      if (session.status === 'ATIVA') {
        const novaPausa = await workSessionService.startPause(session.id);
        setSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'EM_PAUSA',
            pausas: [...(prev.pausas || []), novaPausa],
          };
        });
        setFeedback({
          type: 'info',
          title: 'Intervalo iniciado',
          description: 'A contagem de tempo foi congelada até o retorno.',
        });
      } else if (session.status === 'EM_PAUSA') {
        if (!openPause) {
          await fetchCurrentSession();
          return;
        }

        const pausaFinalizada = await workSessionService.endPause(
          session.id,
          openPause.id,
        );

        setSession(prev => {
          if (!prev) return prev;
          const atualizadas = (prev.pausas || []).map(p =>
            p.id === pausaFinalizada.id ? pausaFinalizada : p,
          );
          return {
            ...prev,
            status: 'ATIVA',
            pausas: atualizadas,
          };
        });
        setFeedback({
          type: 'success',
          title: 'Intervalo finalizado',
          description: 'Bem-vindo de volta! Contagem de horas retomada.',
        });
      }
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Erro ao atualizar status do intervalo.';
      setFeedback({
        type: 'error',
        title: 'Atenção',
        description: detail,
      });
      fetchCurrentSession();
    } finally {
      setIsActionLoading(false);
    }
  }, [session, openPause, fetchCurrentSession]);

  const handleEndSession = useCallback(async () => {
    if (!session) return;
    setFeedback(null);
    setIsActionLoading(true);

    try {
      const finalizada = await workSessionService.endSession(session.id);
      setSession(null);
      setSeconds(0);
      setFeedback({
        type: 'success',
        title: 'Saída registrada!',
        description: `Sessão finalizada com sucesso. Tempo total computado: ${formatSecondsToHMS(
          finalizada.tempo_trabalhado_segundos,
        )}.`,
      });

      onSessionEndedRef.current?.(session);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Erro ao registrar saída.';
      setFeedback({
        type: 'error',
        title: 'Atenção',
        description: detail,
      });
      fetchCurrentSession();
    } finally {
      setIsActionLoading(false);
    }
  }, [session, fetchCurrentSession]);

  const handleContinueSession = useCallback(async () => {
    if (!session) return;
    setFeedback(null);
    setIsActionLoading(true);

    try {
      const prorrogada = await workSessionService.continueSession(session.id);
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          expira_em: prorrogada.expira_em,
        };
      });
      setFeedback({
        type: 'success',
        title: 'Jornada prorrogada!',
        description: `Horário de expiração estendido em +2 horas (novo limite: ${formatTime(
          prorrogada.expira_em,
        )}).`,
      });
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Erro ao prorrogar sessão.';
      setFeedback({
        type: 'error',
        title: 'Atenção',
        description: detail,
      });
    } finally {
      setIsActionLoading(false);
    }
  }, [session]);

  const isSessionActive = session?.status === 'ATIVA';
  const isSessionPaused = session?.status === 'EM_PAUSA';
  const hasOpenSession = isSessionActive || isSessionPaused;

  const msUntilExpiration = session
    ? new Date(session.expira_em).getTime() - currentTimeMs
    : 0;
  const isNearExpiration =
    hasOpenSession &&
    msUntilExpiration > 0 &&
    msUntilExpiration <= 10 * 60 * 1000;

  return {
    session,
    isLoading,
    isActionLoading,
    feedback,
    setFeedback,
    seconds,
    currentTimeMs,
    userSelectedSectorId,
    setUserSelectedSectorId,
    activeSectors,
    selectedSectorId,
    openPause,
    currentSectorName,
    isSessionActive,
    isSessionPaused,
    hasOpenSession,
    msUntilExpiration,
    isNearExpiration,
    fetchCurrentSession,
    handleStartSession,
    handleTogglePause,
    handleEndSession,
    handleContinueSession,
  };
}
