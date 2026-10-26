import { api } from '@/lib/api';
import type { WeeklyWarningListResponse } from '@/types/weeklies';

export interface GetWarningsParams {
  pagina?: number;
  limite?: number;
}

export const warningsApi = {
  /**
   * A01: GET /advertencias/me
   * Lista advertências emitidas para o próprio usuário autenticado.
   */
  async getMyWarnings(
    params?: GetWarningsParams,
  ): Promise<WeeklyWarningListResponse> {
    const response = await api.get<WeeklyWarningListResponse>(
      '/advertencias/me',
      {
        params,
      },
    );
    return response.data;
  },

  /**
   * A02: GET /advertencias/setor/{setor_id}
   * Lista advertências emitidas para membros de um setor (Líder do setor ou Admin).
   */
  async getSectorWarnings(
    sectorId: string,
    params?: GetWarningsParams,
  ): Promise<WeeklyWarningListResponse> {
    const response = await api.get<WeeklyWarningListResponse>(
      `/advertencias/setor/${sectorId}`,
      { params },
    );
    return response.data;
  },
};
