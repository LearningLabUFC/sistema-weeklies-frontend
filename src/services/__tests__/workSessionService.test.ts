import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';
import { workSessionService } from '@/services/workSessionService';
import type {
  CurrentWorkSessionResponse,
  GetMetricsSectorsParams,
  GetMetricsSummaryParams,
  GetMetricsTimelineParams,
  GetMetricsUsersParams,
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

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('workSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockWorkSession: WorkSession = {
    id: 'session-uuid-1',
    usuario_id: 'user-uuid-1',
    setor_id: 'sector-uuid-1',
    entrada_em: '2026-09-26T11:00:00Z',
    saida_em: null,
    expira_em: '2026-09-26T19:00:00Z',
    status: 'ATIVA',
    motivo_encerramento: null,
    tempo_trabalhado_segundos: 0,
  };

  const mockPause: Pause = {
    id: 'pause-uuid-1',
    sessao_id: 'session-uuid-1',
    inicio_em: '2026-09-26T13:00:00Z',
    fim_em: null,
  };

  describe('startSession (POST /work-sessions)', () => {
    it('deve registrar uma nova entrada com sucesso (happy path)', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockWorkSession });

      const result = await workSessionService.startSession('sector-uuid-1');

      expect(api.post).toHaveBeenCalledWith('/work-sessions', {
        setor_id: 'sector-uuid-1',
      });
      expect(result).toEqual(mockWorkSession);
    });

    it('deve propagar erro quando a API retornar 409 Conflict', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: { detail: 'Você já possui uma sessão aberta.' },
        },
      };
      vi.mocked(api.post).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.startSession('sector-uuid-1'),
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('startPause (POST /work-sessions/{id}/pauses)', () => {
    it('deve iniciar uma pausa em uma sessão aberta', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockPause });

      const result = await workSessionService.startPause('session-uuid-1');

      expect(api.post).toHaveBeenCalledWith(
        '/work-sessions/session-uuid-1/pauses',
      );
      expect(result).toEqual(mockPause);
    });

    it('deve propagar erro quando a sessão já tiver uma pausa aberta', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: { detail: 'A sessão já possui uma pausa aberta.' },
        },
      };
      vi.mocked(api.post).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.startPause('session-uuid-1'),
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('endPause (PATCH /work-sessions/{id}/pauses/{pause_id}/end)', () => {
    it('deve encerrar uma pausa com sucesso e retornar status atualizado', async () => {
      const endedPause: Pause = {
        ...mockPause,
        fim_em: '2026-09-26T13:30:00Z',
      };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: endedPause });

      const result = await workSessionService.endPause(
        'session-uuid-1',
        'pause-uuid-1',
      );

      expect(api.patch).toHaveBeenCalledWith(
        '/work-sessions/session-uuid-1/pauses/pause-uuid-1/end',
      );
      expect(result).toEqual(endedPause);
    });

    it('deve propagar erro quando a pausa já estiver encerrada', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: { detail: 'A pausa já foi encerrada.' },
        },
      };
      vi.mocked(api.patch).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.endPause('session-uuid-1', 'pause-uuid-1'),
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('endSession (PATCH /work-sessions/{id}/end)', () => {
    it('deve registrar saída com status FINALIZADA e motivo MANUAL', async () => {
      const finalizada: WorkSession = {
        ...mockWorkSession,
        saida_em: '2026-09-26T15:00:00Z',
        status: 'FINALIZADA',
        motivo_encerramento: 'MANUAL',
        tempo_trabalhado_segundos: 12600,
      };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: finalizada });

      const result = await workSessionService.endSession('session-uuid-1');

      expect(api.patch).toHaveBeenCalledWith(
        '/work-sessions/session-uuid-1/end',
      );
      expect(result.status).toBe('FINALIZADA');
      expect(result.motivo_encerramento).toBe('MANUAL');
      expect(result.tempo_trabalhado_segundos).toBe(12600);
    });

    it('deve propagar erro quando a sessão já estiver encerrada', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: { detail: 'A sessão já foi encerrada.' },
        },
      };
      vi.mocked(api.patch).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.endSession('session-uuid-1'),
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('continueSession (PATCH /work-sessions/{id}/continue)', () => {
    it('deve prorrogar o horário de expiração da sessão com sucesso', async () => {
      const prorrogada: WorkSession = {
        ...mockWorkSession,
        expira_em: '2026-09-26T21:00:00Z', // +2 horas
      };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: prorrogada });

      const result = await workSessionService.continueSession('session-uuid-1');

      expect(api.patch).toHaveBeenCalledWith(
        '/work-sessions/session-uuid-1/continue',
      );
      expect(result.expira_em).toBe('2026-09-26T21:00:00Z');
    });

    it('deve propagar erro quando tentar prorrogar fora da janela de 10 minutos', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: {
            detail:
              'A sessão só pode ser prorrogada nos últimos 10 minutos antes da expiração.',
          },
        },
      };
      vi.mocked(api.patch).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.continueSession('session-uuid-1'),
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('getCurrentSession (GET /work-sessions/current)', () => {
    it('deve retornar os detalhes da sessão aberta atual', async () => {
      const sessionDetail: WorkSessionDetail = {
        ...mockWorkSession,
        pausas: [],
      };
      const apiResponse: CurrentWorkSessionResponse = {
        sessao: sessionDetail,
      };
      vi.mocked(api.get).mockResolvedValueOnce({ data: apiResponse });

      const result = await workSessionService.getCurrentSession();

      expect(api.get).toHaveBeenCalledWith('/work-sessions/current');
      expect(result).toEqual(sessionDetail);
    });

    it('deve retornar null quando não houver sessão ativa (edge case)', async () => {
      const apiResponse: CurrentWorkSessionResponse = {
        sessao: null,
      };
      vi.mocked(api.get).mockResolvedValueOnce({ data: apiResponse });

      const result = await workSessionService.getCurrentSession();

      expect(api.get).toHaveBeenCalledWith('/work-sessions/current');
      expect(result).toBeNull();
    });
  });

  describe('getSessionById (GET /work-sessions/{id})', () => {
    it('deve retornar os dados da sessão pelo id', async () => {
      const sessionDetail: WorkSessionDetail = {
        ...mockWorkSession,
        pausas: [mockPause],
      };
      vi.mocked(api.get).mockResolvedValueOnce({ data: sessionDetail });

      const result = await workSessionService.getSessionById('session-uuid-1');

      expect(api.get).toHaveBeenCalledWith('/work-sessions/session-uuid-1');
      expect(result).toEqual(sessionDetail);
    });

    it('deve propagar erro 404 quando a sessão não for encontrada', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { detail: 'Sessão não encontrada.' },
        },
      };
      vi.mocked(api.get).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.getSessionById('inexistente'),
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('getHistory (GET /work-sessions)', () => {
    it('deve listar o histórico de sessões sem parâmetros', async () => {
      const historyResponse: WorkSessionsHistoryResponse = {
        sessoes: [mockWorkSession],
        total: 1,
        pagina: 1,
        limite: 20,
      };
      vi.mocked(api.get).mockResolvedValueOnce({ data: historyResponse });

      const result = await workSessionService.getHistory();

      expect(api.get).toHaveBeenCalledWith('/work-sessions', {
        params: undefined,
      });
      expect(result.sessoes).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('deve repassar parâmetros de filtro por período, setor, status e paginação quando fornecidos', async () => {
      const historyResponse: WorkSessionsHistoryResponse = {
        sessoes: [],
        total: 0,
        pagina: 2,
        limite: 10,
      };
      vi.mocked(api.get).mockResolvedValueOnce({ data: historyResponse });

      const params: GetWorkSessionsParams = {
        inicio: '2026-09-26T00:00:00Z',
        fim: '2026-09-27T00:00:00Z',
        setor_id: 'setor-uuid-1',
        status: 'FINALIZADA',
        pagina: 2,
        limite: 10,
      };
      const result = await workSessionService.getHistory(params);

      expect(api.get).toHaveBeenCalledWith('/work-sessions', {
        params,
      });
      expect(result.sessoes).toEqual([]);
      expect(result.pagina).toBe(2);
      expect(result.limite).toBe(10);
    });
  });

  describe('getSummary (GET /work-sessions/summary)', () => {
    it('deve retornar resumo de horas calculadas no período', async () => {
      const summaryResponse: WorkSessionSummaryResponse = {
        usuario_id: 'user-uuid-1',
        inicio: '2026-09-26T00:00:00Z',
        fim: '2026-09-27T00:00:00Z',
        tempo_trabalhado_segundos: 12600,
      };
      vi.mocked(api.get).mockResolvedValueOnce({ data: summaryResponse });

      const params = {
        inicio: '2026-09-26T00:00:00Z',
        fim: '2026-09-27T00:00:00Z',
      };
      const result = await workSessionService.getSummary(params);

      expect(api.get).toHaveBeenCalledWith('/work-sessions/summary', {
        params,
      });
      expect(result).toEqual(summaryResponse);
    });

    it('deve repassar setor_id e usuario_id quando fornecidos para líderes/admins', async () => {
      const summaryResponse: WorkSessionSummaryResponse = {
        usuario_id: 'colaborador-uuid',
        setor_id: 'setor-dev-uuid',
        inicio: '2026-09-26T00:00:00Z',
        fim: '2026-09-27T00:00:00Z',
        tempo_trabalhado_segundos: 28800,
      };
      vi.mocked(api.get).mockResolvedValueOnce({ data: summaryResponse });

      const params: GetWorkSessionSummaryParams = {
        inicio: '2026-09-26T00:00:00Z',
        fim: '2026-09-27T00:00:00Z',
        usuario_id: 'colaborador-uuid',
        setor_id: 'setor-dev-uuid',
      };
      const result = await workSessionService.getSummary(params);

      expect(api.get).toHaveBeenCalledWith('/work-sessions/summary', {
        params,
      });
      expect(result.setor_id).toBe('setor-dev-uuid');
      expect(result.usuario_id).toBe('colaborador-uuid');
    });
  });

  describe('getMetricsSummary (GET /work-sessions/metrics/summary)', () => {
    it('deve chamar /work-sessions/metrics/summary com parâmetros corretos e retornar métricas consolidadas', async () => {
      const mockMetricsResponse: MetricsSummaryResponse = {
        inicio: '2026-09-01T00:00:00Z',
        fim: '2026-09-30T23:59:59Z',
        usuario_id: null,
        setor_id: 'setor-dev-uuid',
        tempo_trabalhado_segundos: 288000,
        tempo_pausado_segundos: 18000,
        sessoes_iniciadas: 20,
        usuarios_com_tempo_trabalhado: 5,
      };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMetricsResponse });

      const params: GetMetricsSummaryParams = {
        inicio: '2026-09-01T00:00:00Z',
        fim: '2026-09-30T23:59:59Z',
        setor_id: 'setor-dev-uuid',
      };
      const result = await workSessionService.getMetricsSummary(params);

      expect(api.get).toHaveBeenCalledWith('/work-sessions/metrics/summary', {
        params,
      });
      expect(result).toEqual(mockMetricsResponse);
      expect(result.sessoes_iniciadas).toBe(20);
      expect(result.usuarios_com_tempo_trabalhado).toBe(5);
    });

    it('deve propagar erro 403 caso usuário não seja administrador', async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: {
            detail:
              'Apenas administradores podem acessar métricas consolidadas.',
          },
        },
      };
      vi.mocked(api.get).mockRejectedValueOnce(forbiddenError);

      await expect(
        workSessionService.getMetricsSummary({
          inicio: '2026-09-01T00:00:00Z',
          fim: '2026-09-30T23:59:59Z',
        }),
      ).rejects.toEqual(forbiddenError);
    });
  });

  describe('getMetricsUsers (GET /work-sessions/metrics/users)', () => {
    it('deve chamar /work-sessions/metrics/users com paginação e retornar lista de métricas por usuário', async () => {
      const mockMetricsUsersResponse: MetricsUsersResponse = {
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
      };
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockMetricsUsersResponse,
      });

      const params: GetMetricsUsersParams = {
        inicio: '2026-09-01T00:00:00Z',
        fim: '2026-09-30T23:59:59Z',
        setor_id: 'sector-dev-uuid',
        pagina: 1,
        limite: 20,
      };
      const result = await workSessionService.getMetricsUsers(params);

      expect(api.get).toHaveBeenCalledWith('/work-sessions/metrics/users', {
        params,
      });
      expect(result).toEqual(mockMetricsUsersResponse);
      expect(result.usuarios).toHaveLength(1);
      expect(result.usuarios[0].nome_completo).toBe('Alice Dev');
    });

    it('deve propagar erro quando a chamada falhar', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { detail: 'Erro interno no servidor.' },
        },
      };
      vi.mocked(api.get).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.getMetricsUsers({
          inicio: '2026-09-01T00:00:00Z',
          fim: '2026-09-30T23:59:59Z',
        }),
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('getMetricsSectors (GET /work-sessions/metrics/sectors)', () => {
    it('deve buscar e retornar métricas agrupadas por setor com paginação', async () => {
      const mockMetricsSectorsResponse: MetricsSectorsResponse = {
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
      };
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockMetricsSectorsResponse,
      });

      const params: GetMetricsSectorsParams = {
        inicio: '2026-09-01T00:00:00Z',
        fim: '2026-09-30T23:59:59Z',
        setor_id: 'sector-dev-uuid',
        pagina: 1,
        limite: 10,
      };
      const result = await workSessionService.getMetricsSectors(params);

      expect(api.get).toHaveBeenCalledWith('/work-sessions/metrics/sectors', {
        params,
      });
      expect(result).toEqual(mockMetricsSectorsResponse);
      expect(result.setores).toHaveLength(1);
      expect(result.setores[0].setor_nome).toBe('Desenvolvimento');
      expect(result.setores[0].usuarios_com_tempo_trabalhado).toBe(4);
    });

    it('deve propagar erro quando a chamada falhar', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: { detail: 'Acesso restrito a administradores.' },
        },
      };
      vi.mocked(api.get).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.getMetricsSectors({
          inicio: '2026-09-01T00:00:00Z',
          fim: '2026-09-30T23:59:59Z',
        }),
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('getMetricsTimeline (GET /work-sessions/metrics/timeline)', () => {
    it('deve buscar e retornar dados da evolução temporal com agrupamento', async () => {
      const mockMetricsTimelineResponse: MetricsTimelineResponse = {
        inicio: '2026-10-19T00:00:00Z',
        fim: '2026-10-25T23:59:59Z',
        agrupamento: 'dia',
        fuso: 'America/Sao_Paulo',
        intervalos: [
          {
            inicio: '2026-10-19T00:00:00-03:00',
            fim: '2026-10-20T00:00:00-03:00',
            tempo_trabalhado_segundos: 28800, // 8h
            tempo_pausado_segundos: 3600, // 1h
          },
          {
            inicio: '2026-10-20T00:00:00-03:00',
            fim: '2026-10-21T00:00:00-03:00',
            tempo_trabalhado_segundos: 32400, // 9h
            tempo_pausado_segundos: 1800, // 30m
          },
        ],
      };
      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockMetricsTimelineResponse,
      });

      const params: GetMetricsTimelineParams = {
        inicio: '2026-10-19T00:00:00Z',
        fim: '2026-10-25T23:59:59Z',
        agrupamento: 'dia',
        setor_id: 'sec-dev-1',
      };
      const result = await workSessionService.getMetricsTimeline(params);

      expect(api.get).toHaveBeenCalledWith('/work-sessions/metrics/timeline', {
        params,
      });
      expect(result).toEqual(mockMetricsTimelineResponse);
      expect(result.agrupamento).toBe('dia');
      expect(result.intervalos).toHaveLength(2);
      expect(result.intervalos[0].tempo_trabalhado_segundos).toBe(28800);
    });

    it('deve propagar erro quando a chamada falhar', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { detail: 'Agrupamento inválido.' },
        },
      };
      vi.mocked(api.get).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.getMetricsTimeline({
          inicio: '2026-10-19T00:00:00Z',
          fim: '2026-10-25T23:59:59Z',
          agrupamento: 'dia',
        }),
      ).rejects.toEqual(errorResponse);
    });
  });
});
