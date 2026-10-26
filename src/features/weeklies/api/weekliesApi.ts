import { api } from '@/lib/api';
import type {
  ActionMessageResponse,
  AddWeeklyTaskRequest,
  CreateWeeklyRequest,
  EvaluateWeeklyRequest,
  UpdateWeeklyTaskRequest,
  WeeklyListResponse,
  WeeklyResponse,
  WeeklyStatus,
  WeeklyTaskItemResponse,
} from '@/types/weeklies';

export interface GetMyWeekliesParams {
  setor_id?: string;
  status?: WeeklyStatus;
  pagina?: number;
  limite?: number;
}

export interface GetSectorWeekliesParams {
  status?: WeeklyStatus;
  pagina?: number;
  limite?: number;
}

export const weekliesApi = {
  /**
   * W01: GET /weeklies/me
   * Histórico pessoal de relatórios semanais com paginação e filtros opcionais.
   */
  async getMyWeeklies(
    params?: GetMyWeekliesParams,
  ): Promise<WeeklyListResponse> {
    const response = await api.get<WeeklyListResponse>('/weeklies/me', {
      params,
    });
    return response.data;
  },

  /**
   * W02: GET /weeklies/me/atual?setor_id={setor_id}
   * Obtém (ou cria em rascunho com rollover) o relatório semanal da janela atual para o setor.
   */
  async getCurrentWeekly(sectorId: string): Promise<WeeklyResponse> {
    const response = await api.get<WeeklyResponse>('/weeklies/me/atual', {
      params: { setor_id: sectorId },
    });
    return response.data;
  },

  /**
   * W03: POST /weeklies
   * Criação explícita de relatório na janela atual para o setor.
   */
  async create(data: CreateWeeklyRequest): Promise<WeeklyResponse> {
    const response = await api.post<WeeklyResponse>('/weeklies', data);
    return response.data;
  },

  /**
   * W04: GET /weeklies/{weekly_id}
   * Detalhes completos da weekly, incluindo itens de tarefas e histórico de avaliação/expiração.
   */
  async getById(weeklyId: string): Promise<WeeklyResponse> {
    const response = await api.get<WeeklyResponse>(`/weeklies/${weeklyId}`);
    return response.data;
  },

  /**
   * W05: PATCH /weeklies/{weekly_id}/enviar
   * Envia uma weekly RASCUNHO (na janela) ou reenvia uma REJEITADA (dentro de 24h).
   */
  async submit(weeklyId: string): Promise<WeeklyResponse> {
    const response = await api.patch<WeeklyResponse>(
      `/weeklies/${weeklyId}/enviar`,
    );
    return response.data;
  },

  /**
   * W06: PATCH /weeklies/{weekly_id}/reabrir
   * Reabre uma weekly ENVIADA de volta para RASCUNHO (apenas durante a janela aberta).
   */
  async reopen(weeklyId: string): Promise<WeeklyResponse> {
    const response = await api.patch<WeeklyResponse>(
      `/weeklies/${weeklyId}/reabrir`,
    );
    return response.data;
  },

  /**
   * W07: GET /weeklies/setor/{setor_id}
   * Fila de avaliação de weeklies do setor (Líder do setor ou Admin).
   */
  async getSectorWeeklies(
    sectorId: string,
    params?: GetSectorWeekliesParams,
  ): Promise<WeeklyListResponse> {
    const response = await api.get<WeeklyListResponse>(
      `/weeklies/setor/${sectorId}`,
      {
        params,
      },
    );
    return response.data;
  },

  /**
   * W08: PATCH /weeklies/{weekly_id}/avaliar
   * Aprovação ou rejeição da weekly (Líder ou Admin; feedback obrigatório na rejeição).
   */
  async evaluate(
    weeklyId: string,
    data: EvaluateWeeklyRequest,
  ): Promise<WeeklyResponse> {
    const response = await api.patch<WeeklyResponse>(
      `/weeklies/${weeklyId}/avaliar`,
      data,
    );
    return response.data;
  },

  /**
   * W09: POST /weeklies/{weekly_id}/tasks
   * Vincula uma task existente via task_id OU cria uma task nova inline diretamente na weekly.
   */
  async addTask(
    weeklyId: string,
    data: AddWeeklyTaskRequest,
  ): Promise<WeeklyTaskItemResponse> {
    const response = await api.post<WeeklyTaskItemResponse>(
      `/weeklies/${weeklyId}/tasks`,
      data,
    );
    return response.data;
  },

  /**
   * W10: PATCH /weeklies/{weekly_id}/tasks/{weekly_task_id}
   * Atualiza a marcação semanal de conclusão e/ou impedimento do item da weekly.
   */
  async updateTaskItem(
    weeklyId: string,
    weeklyTaskId: string,
    data: UpdateWeeklyTaskRequest,
  ): Promise<WeeklyTaskItemResponse> {
    const response = await api.patch<WeeklyTaskItemResponse>(
      `/weeklies/${weeklyId}/tasks/${weeklyTaskId}`,
      data,
    );
    return response.data;
  },

  /**
   * W11: DELETE /weeklies/{weekly_id}/tasks/{weekly_task_id}
   * Remove apenas o vínculo da tarefa com este relatório semanal (mantém a task global).
   */
  async removeTaskItem(
    weeklyId: string,
    weeklyTaskId: string,
  ): Promise<ActionMessageResponse> {
    const response = await api.delete<ActionMessageResponse>(
      `/weeklies/${weeklyId}/tasks/${weeklyTaskId}`,
    );
    return response.data;
  },

  // Aliases de conveniência
  updateTask(
    weeklyId: string,
    weeklyTaskId: string,
    data: UpdateWeeklyTaskRequest,
  ): Promise<WeeklyTaskItemResponse> {
    return this.updateTaskItem(weeklyId, weeklyTaskId, data);
  },

  removeTask(
    weeklyId: string,
    weeklyTaskId: string,
  ): Promise<ActionMessageResponse> {
    return this.removeTaskItem(weeklyId, weeklyTaskId);
  },
};
