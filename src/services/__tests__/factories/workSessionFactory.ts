import type {
  MetricsSectorsResponse,
  MetricsSummaryResponse,
  MetricsTimelineResponse,
  MetricsUsersResponse,
  Pause,
  WorkSession,
  WorkSessionDetail,
  WorkSessionsHistoryResponse,
  WorkSessionSummaryResponse,
} from '@/types/workSession';

/**
 * Factory para criar instâncias mock de WorkSession com valores padrão válidos.
 */
export function makeWorkSession(overrides?: Partial<WorkSession>): WorkSession {
  return {
    id: 'session-uuid-1',
    usuario_id: 'user-uuid-1',
    setor_id: 'sector-uuid-1',
    entrada_em: '2026-09-26T11:00:00Z',
    saida_em: null,
    expira_em: '2026-09-26T19:00:00Z',
    status: 'ATIVA',
    motivo_encerramento: null,
    tempo_trabalhado_segundos: 0,
    ...overrides,
  };
}

/**
 * Factory para criar instâncias mock de Pause.
 */
export function makePause(overrides?: Partial<Pause>): Pause {
  return {
    id: 'pause-uuid-1',
    sessao_id: 'session-uuid-1',
    inicio_em: '2026-09-26T13:00:00Z',
    fim_em: null,
    ...overrides,
  };
}

/**
 * Factory para criar instâncias mock de WorkSessionDetail (sessão com lista de pausas).
 */
export function makeWorkSessionDetail(
  overrides?: Partial<WorkSessionDetail>,
): WorkSessionDetail {
  const baseSession = makeWorkSession();
  return {
    ...baseSession,
    pausas: [],
    ...overrides,
  };
}

/**
 * Factory para resposta paginada do histórico de sessões.
 */
export function makeWorkSessionsHistoryResponse(
  overrides?: Partial<WorkSessionsHistoryResponse>,
): WorkSessionsHistoryResponse {
  return {
    sessoes: [makeWorkSession()],
    total: 1,
    pagina: 1,
    limite: 20,
    ...overrides,
  };
}

/**
 * Factory para resposta do resumo consolidado de horas.
 */
export function makeWorkSessionSummaryResponse(
  overrides?: Partial<WorkSessionSummaryResponse>,
): WorkSessionSummaryResponse {
  return {
    usuario_id: 'user-uuid-1',
    inicio: '2026-09-26T00:00:00Z',
    fim: '2026-09-27T00:00:00Z',
    tempo_trabalhado_segundos: 12600,
    ...overrides,
  };
}

/**
 * Factory para métricas consolidadas de resumo.
 */
export function makeMetricsSummaryResponse(
  overrides?: Partial<MetricsSummaryResponse>,
): MetricsSummaryResponse {
  return {
    inicio: '2026-09-01T00:00:00Z',
    fim: '2026-09-30T23:59:59Z',
    usuario_id: null,
    setor_id: 'setor-dev-uuid',
    tempo_trabalhado_segundos: 288000,
    tempo_pausado_segundos: 18000,
    sessoes_iniciadas: 20,
    usuarios_com_tempo_trabalhado: 5,
    ...overrides,
  };
}

/**
 * Factory para métricas por usuário.
 */
export function makeMetricsUsersResponse(
  overrides?: Partial<MetricsUsersResponse>,
): MetricsUsersResponse {
  return {
    inicio: '2026-09-01T00:00:00Z',
    fim: '2026-09-30T23:59:59Z',
    pagina: 1,
    limite: 20,
    total: 1,
    usuarios: [
      {
        usuario_id: 'user-1',
        nome_completo: 'Alice Dev',
        tempo_trabalhado_segundos: 28800,
        tempo_pausado_segundos: 1800,
        sessoes_iniciadas: 4,
      },
    ],
    ...overrides,
  };
}

/**
 * Factory para métricas agrupadas por setor.
 */
export function makeMetricsSectorsResponse(
  overrides?: Partial<MetricsSectorsResponse>,
): MetricsSectorsResponse {
  return {
    inicio: '2026-09-01T00:00:00Z',
    fim: '2026-09-30T23:59:59Z',
    pagina: 1,
    limite: 10,
    total: 1,
    setores: [
      {
        setor_id: 'sector-dev-uuid',
        setor_nome: 'Desenvolvimento',
        tempo_trabalhado_segundos: 144000,
        tempo_pausado_segundos: 7200,
        sessoes_iniciadas: 15,
        usuarios_com_tempo_trabalhado: 4,
      },
    ],
    ...overrides,
  };
}

/**
 * Factory para métricas da linha do tempo.
 */
export function makeMetricsTimelineResponse(
  overrides?: Partial<MetricsTimelineResponse>,
): MetricsTimelineResponse {
  return {
    inicio: '2026-10-19T00:00:00Z',
    fim: '2026-10-25T23:59:59Z',
    agrupamento: 'dia',
    fuso: 'America/Sao_Paulo',
    intervalos: [
      {
        inicio: '2026-10-19T00:00:00-03:00',
        fim: '2026-10-20T00:00:00-03:00',
        tempo_trabalhado_segundos: 28800,
        tempo_pausado_segundos: 3600,
      },
      {
        inicio: '2026-10-20T00:00:00-03:00',
        fim: '2026-10-21T00:00:00-03:00',
        tempo_trabalhado_segundos: 32400,
        tempo_pausado_segundos: 1800,
      },
    ],
    ...overrides,
  };
}
