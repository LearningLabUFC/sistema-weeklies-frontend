import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';
import { workSessionService } from '@/services/workSessionService';
import type {
  CurrentWorkSessionResponse,
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
  },
}));

describe('workSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockWorkSession: WorkSession = {
    id: 'session-uuid-1',
    usuario_id: 'user-uuid-1',
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

      const result = await workSessionService.startSession();

      expect(api.post).toHaveBeenCalledWith('/work-sessions');
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

      await expect(workSessionService.startSession()).rejects.toEqual(
        errorResponse,
      );
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

  describe('endPause (POST /work-sessions/{id}/pauses/{pause_id}/end)', () => {
    it('deve encerrar uma pausa com sucesso e retornar status atualizado', async () => {
      const endedPause: Pause = {
        ...mockPause,
        fim_em: '2026-09-26T13:30:00Z',
      };
      vi.mocked(api.post).mockResolvedValueOnce({ data: endedPause });

      const result = await workSessionService.endPause(
        'session-uuid-1',
        'pause-uuid-1',
      );

      expect(api.post).toHaveBeenCalledWith(
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
      vi.mocked(api.post).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.endPause('session-uuid-1', 'pause-uuid-1'),
      ).rejects.toEqual(errorResponse);
    });
  });

  describe('endSession (POST /work-sessions/{id}/end)', () => {
    it('deve registrar saída com status FINALIZADA e motivo MANUAL', async () => {
      const finalizada: WorkSession = {
        ...mockWorkSession,
        saida_em: '2026-09-26T15:00:00Z',
        status: 'FINALIZADA',
        motivo_encerramento: 'MANUAL',
        tempo_trabalhado_segundos: 12600,
      };
      vi.mocked(api.post).mockResolvedValueOnce({ data: finalizada });

      const result = await workSessionService.endSession('session-uuid-1');

      expect(api.post).toHaveBeenCalledWith(
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
      vi.mocked(api.post).mockRejectedValueOnce(errorResponse);

      await expect(
        workSessionService.endSession('session-uuid-1'),
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
      };
      vi.mocked(api.get).mockResolvedValueOnce({ data: historyResponse });

      const result = await workSessionService.getHistory();

      expect(api.get).toHaveBeenCalledWith('/work-sessions', {
        params: undefined,
      });
      expect(result.sessoes).toHaveLength(1);
    });

    it('deve repassar parâmetros de filtro por período quando fornecidos', async () => {
      const historyResponse: WorkSessionsHistoryResponse = {
        sessoes: [],
      };
      vi.mocked(api.get).mockResolvedValueOnce({ data: historyResponse });

      const params = {
        inicio: '2026-09-26T00:00:00Z',
        fim: '2026-09-27T00:00:00Z',
      };
      const result = await workSessionService.getHistory(params);

      expect(api.get).toHaveBeenCalledWith('/work-sessions', {
        params,
      });
      expect(result.sessoes).toEqual([]);
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
  });
});
