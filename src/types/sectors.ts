/**
 * Tipos e DTOs para o módulo de Setores (Sectors).
 * Baseado no schema real do backend em app/sectors/schemas.py.
 */

export type SectorMemberRole = 'membro' | 'lider';

// ── Requests ─────────────────────────────────────────────────

export interface CreateSectorRequest {
  nome: string;
  descricao?: string | null;
}

export interface UpdateSectorRequest {
  nome?: string | null;
  descricao?: string | null;
  ativo?: boolean | null;
}

export interface AddMemberRequest {
  usuario_id: string;
  papel?: SectorMemberRole;
  data_ingresso?: string | null; // YYYY-MM-DD
}

export interface ChangeMemberRoleRequest {
  papel: SectorMemberRole;
}

// ── Responses ────────────────────────────────────────────────

export interface SectorMemberItem {
  id: string; // UUID do usuário
  nome_completo: string;
  email: string;
  papel: SectorMemberRole;
}

export interface SectorListItem {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criado_em: string; // ISO 8601
  qtd_membros: number;
  qtd_lideres: number;
}

export interface SectorDetail {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criado_em: string;
  membros: SectorMemberItem[];
}

export interface SectorListResponse {
  setores: SectorListItem[];
  total: number;
  pagina: number;
  limite: number;
}

export interface SectorActionResponse {
  mensagem: string;
}

export interface UserSectorItem {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  papel: SectorMemberRole;
}
