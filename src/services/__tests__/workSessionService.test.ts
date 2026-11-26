import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';
import {
  makeMetricsSectorsResponse,
  makeMetricsSummaryResponse,
  makeMetricsTimelineResponse,
  makeMetricsUsersResponse,
  makePause,
  makeWorkSession,
  makeWorkSessionDetail,
  makeWorkSessionsHistoryResponse,
  makeWorkSessionSummaryResponse,
} from '@/services/__tests__/factories/workSessionFactory';
import { workSessionService } from '@/services/workSessionService';
import type {
  CurrentWorkSessionResponse,
  GetMetricsSectorsParams,
  GetMetricsSummaryParams,
  GetMetricsTimelineParams,
  GetMetricsUsersParams,
  GetWorkSessionsParams,
  GetWorkSessionSummaryParams,
  WorkSession,
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

  const mockWorkSession = makeWorkSession();
  const mockPause = makePause();

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
      const endedPause = makePause({ fim_em: '2026-09-26T13:30:00Z' });
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
      const finalizada: WorkSession = makeWorkSession({
        saida_em: '2026-09-26T15:00:00Z',
        status: 'FINALIZADA',
        motivo_encerramento: 'MANUAL',
        tempo_trabalhado_segundos: 12600,
      });
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
      const prorrogada: WorkSession = makeWorkSession({
        expira_em: '2026-09-26T21:00:00Z',
      });
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
      const sessionDetail = makeWorkSessionDetail();
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
      const sessionDetail = makeWorkSessionDetail({
        pausas: [mockPause],
      });
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
      const historyResponse = makeWorkSessionsHistoryResponse();
      vi.mocked(api.get).mockResolvedValueOnce({ data: historyResponse });

      const result = await workSessionService.getHistory();

      expect(api.get).toHaveBeenCalledWith('/work-sessions', {
        params: undefined,
      });
      expect(result.sessoes).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('deve repassar parâmetros de filtro por período, setor, status e paginação quando fornecidos', async () => {
      const historyResponse = makeWorkSessionsHistoryResponse({
        sessoes: [],
        total: 0,
        pagina: 2,
        limite: 10,
      });
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
      const summaryResponse = makeWorkSessionSummaryResponse();
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
      const summaryResponse = makeWorkSessionSummaryResponse({
        usuario_id: 'colaborador-uuid',
        setor_id: 'setor-dev-uuid',
        tempo_trabalhado_segundos: 28800,
      });
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
      const mockMetricsResponse = makeMetricsSummaryResponse();
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
      const mockMetricsUsersResponse = makeMetricsUsersResponse();
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
      const mockMetricsSectorsResponse = makeMetricsSectorsResponse();
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
      const mockMetricsTimelineResponse = makeMetricsTimelineResponse();
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
