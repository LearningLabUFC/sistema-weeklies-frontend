import { api } from '@/lib/api';
import type {
  ActionMessageResponse,
  CreateTaskAssignmentRequest,
  CreateTaskRequest,
  EligibleCollaboratorsResponse,
  TaskAssignmentResponse,
  TaskListResponse,
  TaskResponse,
  TaskStatus,
  UpdateTaskPrazoRequest,
  UpdateTaskRequest,
} from '@/types/weeklies';

export interface GetMyTasksParams {
  setor_id?: string;
  status?: TaskStatus;
  pagina?: number;
  limite?: number;
}

export interface GetAuditTasksParams {
  pagina?: number;
  limite?: number;
}

export const tasksApi = {
  /**
   * T01: GET /tasks/me
   * Lista tarefas do próprio usuário com filtros opcionais por setor e status.
   */
  async getMyTasks(params?: GetMyTasksParams): Promise<TaskListResponse> {
    const response = await api.get<TaskListResponse>('/tasks/me', { params });
    return response.data;
  },

  /**
   * T02: POST /tasks
   * Criação de tarefa avulsa associada a um setor onde o usuário é membro.
   */
  async create(data: CreateTaskRequest): Promise<TaskResponse> {
    const response = await api.post<TaskResponse>('/tasks', data);
    return response.data;
  },

  /**
   * T03: PATCH /tasks/{task_id}
   * Atualização de título e descrição (proprietário, sob validações de escrita).
   */
  async update(taskId: string, data: UpdateTaskRequest): Promise<TaskResponse> {
    const response = await api.patch<TaskResponse>(`/tasks/${taskId}`, data);
    return response.data;
  },

  /**
   * T04: PATCH /tasks/{task_id}/prazo
   * Alteração de prazo de conclusão (Líder do setor ou Admin).
   */
  async updatePrazo(
    taskId: string,
    data: UpdateTaskPrazoRequest,
  ): Promise<TaskResponse> {
    const response = await api.patch<TaskResponse>(
      `/tasks/${taskId}/prazo`,
      data,
    );
    return response.data;
  },

  /**
   * T05: DELETE /tasks/{task_id}
   * Soft delete da tarefa (muda status para REMOVIDA_PELO_LIDER; Líder ou Admin).
   */
  async delete(taskId: string): Promise<ActionMessageResponse> {
    const response = await api.delete<ActionMessageResponse>(
      `/tasks/${taskId}`,
    );
    return response.data;
  },

  /**
   * T06: GET /tasks/setor/{setor_id}/auditoria
   * Fila de auditoria de tarefas do setor (Líder do setor ou Admin).
   */
  async getSectorAuditTasks(
    sectorId: string,
    params?: GetAuditTasksParams,
  ): Promise<TaskListResponse> {
    const response = await api.get<TaskListResponse>(
      `/tasks/setor/${sectorId}/auditoria`,
      {
        params,
      },
    );
    return response.data;
  },

  /**
   * T07: PATCH /tasks/{task_id}/concluir
   * Conclusão direta de tarefa em auditoria ou pendente (Líder ou Admin; bloqueia auto-conclusão).
   */
  async conclude(taskId: string): Promise<TaskResponse> {
    const response = await api.patch<TaskResponse>(`/tasks/${taskId}/concluir`);
    return response.data;
  },

  /**
   * T08: POST /tasks/{task_id}/atribuir
   * Convida um colaborador ativo a participar da tarefa.
   */
  async assign(
    taskId: string,
    data: CreateTaskAssignmentRequest,
  ): Promise<TaskAssignmentResponse> {
    const response = await api.post<TaskAssignmentResponse>(
      `/tasks/${taskId}/atribuir`,
      data,
    );
    return response.data;
  },

  /**
   * GET /tasks/colaboradores-elegiveis
   * Lista colaboradores ativos elegíveis para atribuição de tarefas.
   */
  async listEligibleCollaborators(params?: {
    busca?: string;
    task_id?: string;
    pagina?: number;
    limite?: number;
  }): Promise<EligibleCollaboratorsResponse> {
    const response = await api.get<EligibleCollaboratorsResponse>(
      '/tasks/colaboradores-elegiveis',
      { params },
    );
    return response.data;
  },
};
