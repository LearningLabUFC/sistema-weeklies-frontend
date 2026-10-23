import { api } from '@/lib/api';
import type {
  AddMemberRequest,
  ChangeMemberRoleRequest,
  CreateSectorRequest,
  SectorActionResponse,
  SectorDetail,
  SectorListResponse,
  UpdateSectorRequest,
  UserSectorItem,
} from '@/types/sectors';

export interface GetSectorsParams {
  pagina?: number;
  limite?: number;
}

export const sectorsApi = {
  /**
   * S01: GET /sectors
   * Catálogo/seletor paginado de setores do sistema e listagem administrativa.
   */
  async list(params?: GetSectorsParams): Promise<SectorListResponse> {
    const response = await api.get<SectorListResponse>('/sectors', { params });
    return response.data;
  },

  /**
   * S01b: GET /sectors/me
   * Retorna os setores aos quais o usuário autenticado está vinculado.
   */
  async getMySectors(): Promise<UserSectorItem[]> {
    const response = await api.get<UserSectorItem[]>('/sectors/me');
    return response.data;
  },

  /**
   * S02: POST /sectors
   * Criação de novo setor (exclusivo Admin/SuperAdmin). Retorna { mensagem }.
   */
  async create(data: CreateSectorRequest): Promise<SectorActionResponse> {
    const response = await api.post<SectorActionResponse>('/sectors', data);
    return response.data;
  },

  /**
   * S03: GET /sectors/{sector_id}
   * Detalhe do setor com lista de membros (exclusivo Admin/SuperAdmin).
   */
  async getById(sectorId: string): Promise<SectorDetail> {
    const response = await api.get<SectorDetail>(`/sectors/${sectorId}`);
    return response.data;
  },

  /**
   * S04: PATCH /sectors/{sector_id}
   * Edição de nome, descrição e status de ativação (Admin/SuperAdmin). Retorna { mensagem }.
   */
  async update(
    sectorId: string,
    data: UpdateSectorRequest,
  ): Promise<SectorActionResponse> {
    const response = await api.patch<SectorActionResponse>(
      `/sectors/${sectorId}`,
      data,
    );
    return response.data;
  },

  /**
   * S05: DELETE /sectors/{sector_id}
   * Desativação via soft delete (exclusivo SuperAdmin). Retorna { mensagem }.
   */
  async delete(sectorId: string): Promise<SectorActionResponse> {
    const response = await api.delete<SectorActionResponse>(
      `/sectors/${sectorId}`,
    );
    return response.data;
  },

  /**
   * S06: POST /sectors/{sector_id}/members
   * Adiciona membro ou líder ao setor (Admin/SuperAdmin). Retorna { mensagem }.
   */
  async addMember(
    sectorId: string,
    data: AddMemberRequest,
  ): Promise<SectorActionResponse> {
    const response = await api.post<SectorActionResponse>(
      `/sectors/${sectorId}/members`,
      data,
    );
    return response.data;
  },

  /**
   * S07: DELETE /sectors/{sector_id}/members/{user_id}
   * Remove vínculo do usuário com o setor (Admin/SuperAdmin). Retorna { mensagem }.
   */
  async removeMember(
    sectorId: string,
    userId: string,
  ): Promise<SectorActionResponse> {
    const response = await api.delete<SectorActionResponse>(
      `/sectors/${sectorId}/members/${userId}`,
    );
    return response.data;
  },

  /**
   * S08: PATCH /sectors/{sector_id}/members/{user_id}/role
   * Alterna papel entre 'membro' e 'lider' (Admin/SuperAdmin). Retorna { mensagem }.
   */
  async updateMemberRole(
    sectorId: string,
    userId: string,
    data: ChangeMemberRoleRequest,
  ): Promise<SectorActionResponse> {
    const response = await api.patch<SectorActionResponse>(
      `/sectors/${sectorId}/members/${userId}/role`,
      data,
    );
    return response.data;
  },
};
