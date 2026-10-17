import { api } from '@/lib/api';
import type {
  AssignmentStatus,
  TaskAssignmentListResponse,
  TaskAssignmentResponse,
} from '@/types/weeklies';

export interface GetMyAssignmentsParams {
  tipo: 'recebidas' | 'enviadas';
  status?: AssignmentStatus;
  pagina?: number;
  limite?: number;
}

export const assignmentsApi = {
  /**
   * C01: GET /atribuicoes/me
   * Caixa de convites de tarefas recebidos ou enviados.
   */
  async getMyAssignments(
    params: GetMyAssignmentsParams,
  ): Promise<TaskAssignmentListResponse> {
    const response = await api.get<TaskAssignmentListResponse>(
      '/atribuicoes/me',
      {
        params,
      },
    );
    return response.data;
  },

  /**
   * C02: PATCH /atribuicoes/{assignment_id}/aceitar
   * Aceita convite de colaboração em tarefa (somente o destinatário).
   */
  async accept(assignmentId: string): Promise<TaskAssignmentResponse> {
    const response = await api.patch<TaskAssignmentResponse>(
      `/atribuicoes/${assignmentId}/aceitar`,
    );
    return response.data;
  },

  /**
   * C03: PATCH /atribuicoes/{assignment_id}/recusar
   * Recusa convite de colaboração em tarefa (somente o destinatário).
   */
  async reject(assignmentId: string): Promise<TaskAssignmentResponse> {
    const response = await api.patch<TaskAssignmentResponse>(
      `/atribuicoes/${assignmentId}/recusar`,
    );
    return response.data;
  },
};
