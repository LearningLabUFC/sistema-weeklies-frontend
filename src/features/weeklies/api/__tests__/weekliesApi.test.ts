import { describe, expect, it, vi } from 'vitest';

import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { assignmentsApi } from '@/features/weeklies/api/assignmentsApi';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { warningsApi } from '@/features/weeklies/api/warningsApi';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Weeklies Module APIs (T01-T08, W01-W11, C01-C03, A01-A02, D01-D02)', () => {
  describe('tasksApi', () => {
    it('T01: getMyTasks chama GET /tasks/me com filtros', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { tasks: [], total: 0, pagina: 1, limite: 20 },
      });
      await tasksApi.getMyTasks({ setor_id: 'sec-1', status: 'PENDENTE' });
      expect(api.get).toHaveBeenCalledWith('/tasks/me', {
        params: { setor_id: 'sec-1', status: 'PENDENTE' },
      });
    });

    it('T02: create chama POST /tasks', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'task-1' } });
      await tasksApi.create({ setor_id: 'sec-1', titulo: 'Nova tarefa' });
      expect(api.post).toHaveBeenCalledWith('/tasks', {
        setor_id: 'sec-1',
        titulo: 'Nova tarefa',
      });
    });

    it('T04: updatePrazo chama PATCH /tasks/{id}/prazo', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: { id: 'task-1' } });
      await tasksApi.updatePrazo('task-1', { prazo_conclusao: '2026-10-20' });
      expect(api.patch).toHaveBeenCalledWith('/tasks/task-1/prazo', {
        prazo_conclusao: '2026-10-20',
      });
    });

    it('T07: conclude chama PATCH /tasks/{id}/concluir', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: { id: 'task-1' } });
      await tasksApi.conclude('task-1');
      expect(api.patch).toHaveBeenCalledWith('/tasks/task-1/concluir');
    });

    it('T08: assign chama POST /tasks/{id}/atribuir', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'assign-1' } });
      await tasksApi.assign('task-1', { atribuido_id: 'user-2' });
      expect(api.post).toHaveBeenCalledWith('/tasks/task-1/atribuir', {
        atribuido_id: 'user-2',
      });
    });
  });

  describe('weekliesApi', () => {
    it('W01: getMyWeeklies chama GET /weeklies/me', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { weeklies: [], total: 0, pagina: 1, limite: 20 },
      });
      await weekliesApi.getMyWeeklies({ pagina: 1 });
      expect(api.get).toHaveBeenCalledWith('/weeklies/me', {
        params: { pagina: 1 },
      });
    });

    it('W02: getCurrentWeekly passa setor_id como query param obrigatório', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { id: 'weekly-1', status: 'RASCUNHO' },
      });
      await weekliesApi.getCurrentWeekly('sec-1');
      expect(api.get).toHaveBeenCalledWith('/weeklies/me/atual', {
        params: { setor_id: 'sec-1' },
      });
    });

    it('W05: submit chama PATCH /weeklies/{id}/enviar sem body', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: { id: 'weekly-1', status: 'ENVIADA' },
      });
      await weekliesApi.submit('weekly-1');
      expect(api.patch).toHaveBeenCalledWith('/weeklies/weekly-1/enviar');
    });

    it('W06: reopen chama PATCH /weeklies/{id}/reabrir sem body', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: { id: 'weekly-1', status: 'RASCUNHO' },
      });
      await weekliesApi.reopen('weekly-1');
      expect(api.patch).toHaveBeenCalledWith('/weeklies/weekly-1/reabrir');
    });

    it('W08: evaluate chama PATCH /weeklies/{id}/avaliar com status e observacao_lider', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: { id: 'weekly-1', status: 'APROVADA' },
      });
      await weekliesApi.evaluate('weekly-1', {
        status: 'APROVADA',
        observacao_lider: 'Bom trabalho',
      });
      expect(api.patch).toHaveBeenCalledWith('/weeklies/weekly-1/avaliar', {
        status: 'APROVADA',
        observacao_lider: 'Bom trabalho',
      });
    });

    it('W09: addTask chama POST /weeklies/{id}/tasks', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { id: 'item-1', task_id: 'task-1' },
      });
      await weekliesApi.addTask('weekly-1', { titulo: 'Tarefa inline' });
      expect(api.post).toHaveBeenCalledWith('/weeklies/weekly-1/tasks', {
        titulo: 'Tarefa inline',
      });
    });

    it('W10: updateTaskItem chama PATCH /weeklies/{id}/tasks/{itemId}', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: { id: 'item-1', concluida: true },
      });
      await weekliesApi.updateTaskItem('weekly-1', 'item-1', {
        concluida: true,
        impedimento: null,
      });
      expect(api.patch).toHaveBeenCalledWith(
        '/weeklies/weekly-1/tasks/item-1',
        {
          concluida: true,
          impedimento: null,
        },
      );
    });

    it('W11: removeTaskItem chama DELETE /weeklies/{id}/tasks/{itemId}', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({
        data: { mensagem: 'Item removido.' },
      });
      await weekliesApi.removeTaskItem('weekly-1', 'item-1');
      expect(api.delete).toHaveBeenCalledWith(
        '/weeklies/weekly-1/tasks/item-1',
      );
    });
  });

  describe('assignmentsApi', () => {
    it('C01: getMyAssignments passa tipo recebidas/enviadas', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { atribuicoes: [], total: 0, pagina: 1, limite: 20 },
      });
      await assignmentsApi.getMyAssignments({ tipo: 'recebidas' });
      expect(api.get).toHaveBeenCalledWith('/atribuicoes/me', {
        params: { tipo: 'recebidas' },
      });
    });

    it('C02: accept chama PATCH /atribuicoes/{id}/aceitar', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: { id: 'ass-1', status: 'ACEITA' },
      });
      await assignmentsApi.accept('ass-1');
      expect(api.patch).toHaveBeenCalledWith('/atribuicoes/ass-1/aceitar');
    });

    it('C03: reject chama PATCH /atribuicoes/{id}/recusar', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: { id: 'ass-1', status: 'RECUSADA' },
      });
      await assignmentsApi.reject('ass-1');
      expect(api.patch).toHaveBeenCalledWith('/atribuicoes/ass-1/recusar');
    });
  });

  describe('warningsApi', () => {
    it('A01: getMyWarnings chama GET /advertencias/me', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { advertencias: [], total: 0, pagina: 1, limite: 20 },
      });
      await warningsApi.getMyWarnings();
      expect(api.get).toHaveBeenCalledWith('/advertencias/me', {
        params: undefined,
      });
    });

    it('A02: getSectorWarnings chama GET /advertencias/setor/{id}', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { advertencias: [], total: 0, pagina: 1, limite: 20 },
      });
      await warningsApi.getSectorWarnings('sec-1');
      expect(api.get).toHaveBeenCalledWith('/advertencias/setor/sec-1', {
        params: undefined,
      });
    });
  });

  describe('dashboardApi', () => {
    it('D01: getSectorDashboard chama GET /dashboard/setor/{id}', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { setor_id: 'sec-1', total_membros: 5 },
      });
      await dashboardApi.getSectorDashboard('sec-1', {
        semana_referencia: '2026-10-05',
      });
      expect(api.get).toHaveBeenCalledWith('/dashboard/setor/sec-1', {
        params: { semana_referencia: '2026-10-05' },
      });
    });

    it('D02: getGlobalDashboard chama GET /dashboard/geral', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { total_setores: 3, total_membros: 15 },
      });
      await dashboardApi.getGlobalDashboard();
      expect(api.get).toHaveBeenCalledWith('/dashboard/geral', {
        params: undefined,
      });
    });
  });
});
