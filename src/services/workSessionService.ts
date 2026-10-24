import { api } from '@/lib/api';
import type {
  CurrentWorkSessionResponse,
  GetMetricsSectorsParams,
  GetMetricsSummaryParams,
  GetMetricsTimelineParams,
  GetMetricsUsersParams,
  GetWorkSessionsParams,
  GetWorkSessionSummaryParams,
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

export const workSessionService = {
  /**
   * 1. POST /work-sessions
   * Registra a entrada do usuário autenticado no setor especificado e define a expiração para 8h depois.
   */
  async startSession(setorId: string): Promise<WorkSession> {
    const { data } = await api.post<WorkSession>('/work-sessions', {
      setor_id: setorId,
    });
    return data;
  },

  /**
   * 2. POST /work-sessions/{session_id}/pauses
   * Inicia uma pausa na sessão aberta, alterando o status para EM_PAUSA.
   */
  async startPause(sessionId: string): Promise<Pause> {
    const { data } = await api.post<Pause>(
      `/work-sessions/${sessionId}/pauses`,
    );
    return data;
  },

  /**
   * 3. PATCH /work-sessions/{session_id}/pauses/{pause_id}/end
   * Encerra a pausa e retoma a contagem de trabalho (status volta para ATIVA).
   */
  async endPause(sessionId: string, pauseId: string): Promise<Pause> {
    const { data } = await api.patch<Pause>(
      `/work-sessions/${sessionId}/pauses/${pauseId}/end`,
    );
    return data;
  },

  /**
   * 4. PATCH /work-sessions/{session_id}/end
   * Registra a saída manual (status FINALIZADA, motivo MANUAL).
   * Encerra pausa aberta simultaneamente caso exista.
   */
  async endSession(sessionId: string): Promise<WorkSession> {
    const { data } = await api.patch<WorkSession>(
      `/work-sessions/${sessionId}/end`,
    );
    return data;
  },

  /**
   * 5. PATCH /work-sessions/{session_id}/continue
   * Prorroga o horário de expiração da sessão aberta em +2 horas (permitido nos 10min finais).
   */
  async continueSession(sessionId: string): Promise<WorkSession> {
    const { data } = await api.patch<WorkSession>(
      `/work-sessions/${sessionId}/continue`,
    );
    return data;
  },

  /**
   * 5. GET /work-sessions/current
   * Consulta a sessão atual do próprio usuário com suas pausas e tempo provisório.
   * Retorna { sessao: null } caso não haja sessão aberta.
   */
  async getCurrentSession(): Promise<WorkSessionDetail | null> {
    const { data } = await api.get<CurrentWorkSessionResponse>(
      '/work-sessions/current',
    );
    return data.sessao;
  },

  /**
   * 6. GET /work-sessions/{session_id}
   * Consulta os detalhes de uma sessão específica e suas pausas.
   */
  async getSessionById(sessionId: string): Promise<WorkSessionDetail> {
    const { data } = await api.get<WorkSessionDetail>(
      `/work-sessions/${sessionId}`,
    );
    return data;
  },

  /**
   * 7. GET /work-sessions
   * Lista o histórico de sessões com filtros opcionais de usuario_id, inicio e fim.
   */
  async getHistory(
    params?: GetWorkSessionsParams,
  ): Promise<WorkSessionsHistoryResponse> {
    const { data } = await api.get<WorkSessionsHistoryResponse>(
      '/work-sessions',
      { params },
    );
    return data;
  },

  /**
   * 8. GET /work-sessions/summary
   * Retorna o resumo do tempo trabalhado no período informado.
   */
  async getSummary(
    params: GetWorkSessionSummaryParams,
  ): Promise<WorkSessionSummaryResponse> {
    const { data } = await api.get<WorkSessionSummaryResponse>(
      '/work-sessions/summary',
      { params },
    );
    return data;
  },

  /**
   * 9. GET /work-sessions/metrics/summary
   * Retorna o resumo executivo de métricas consolidadas (Admin / Super Admin).
   */
  async getMetricsSummary(
    params: GetMetricsSummaryParams,
  ): Promise<MetricsSummaryResponse> {
    const { data } = await api.get<MetricsSummaryResponse>(
      '/work-sessions/metrics/summary',
      { params },
    );
    return data;
  },

  /**
   * 10. GET /work-sessions/metrics/users
   * Retorna as métricas detalhadas e paginadas por colaborador (Admin / Super Admin).
   */
  async getMetricsUsers(
    params: GetMetricsUsersParams,
  ): Promise<MetricsUsersResponse> {
    const { data } = await api.get<MetricsUsersResponse>(
      '/work-sessions/metrics/users',
      { params },
    );
    return data;
  },

  /**
   * 11. GET /work-sessions/metrics/sectors
   * Retorna as métricas detalhadas e paginadas agrupadas por setor (Admin / Super Admin).
   */
  async getMetricsSectors(
    params: GetMetricsSectorsParams,
  ): Promise<MetricsSectorsResponse> {
    const { data } = await api.get<MetricsSectorsResponse>(
      '/work-sessions/metrics/sectors',
      { params },
    );
    return data;
  },

  /**
   * 12. GET /work-sessions/metrics/timeline
   * Retorna a evolução temporal das métricas cronológicas agrupadas por dia, semana ou mês.
   */
  async getMetricsTimeline(
    params: GetMetricsTimelineParams,
  ): Promise<MetricsTimelineResponse> {
    const { data } = await api.get<MetricsTimelineResponse>(
      '/work-sessions/metrics/timeline',
      { params },
    );
    return data;
  },
};
