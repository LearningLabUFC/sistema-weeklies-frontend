import { api } from '@/lib/api';
import type {
  GlobalDashboardResponse,
  SectorDashboardResponse,
} from '@/types/weeklies';

export interface GetDashboardParams {
  semana_referencia?: string; // YYYY-MM-DD
}

export const dashboardApi = {
  /**
   * D01: GET /dashboard/setor/{setor_id}
   * Métricas consolidadas do setor para a semana de referência (Líder do setor ou Admin).
   */
  async getSectorDashboard(
    sectorId: string,
    params?: GetDashboardParams,
  ): Promise<SectorDashboardResponse> {
    const response = await api.get<SectorDashboardResponse>(
      `/dashboard/setor/${sectorId}`,
      { params },
    );
    return response.data;
  },

  /**
   * D02: GET /dashboard/geral
   * Métricas consolidadas de todos os setores para a semana de referência (Admin/SuperAdmin).
   */
  async getGlobalDashboard(
    params?: GetDashboardParams,
  ): Promise<GlobalDashboardResponse> {
    const response = await api.get<GlobalDashboardResponse>(
      '/dashboard/geral',
      {
        params,
      },
    );
    return response.data;
  },
};
