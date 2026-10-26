/**
 * Tipos e DTOs para o módulo de Weeklies, Tarefas, Convites, Advertências e Dashboards.
 * Baseado no schema real do backend em app/weeklies/schemas.py.
 */

// ── Estados canônicos ────────────────────────────────────────

export type WeeklyStatus =
  | 'RASCUNHO'
  | 'ENVIADA'
  | 'APROVADA'
  | 'REJEITADA'
  | 'EXPIRADA';

export type TaskStatus =
  | 'PENDENTE'
  | 'CONCLUIDA'
  | 'EM_AUDITORIA'
  | 'REMOVIDA_PELO_LIDER';

export type WeeklyTaskOrigem = 'NOVA' | 'HERDADA';

export type AssignmentStatus = 'PENDENTE' | 'ACEITA' | 'RECUSADA' | 'EXPIRADA';

export type WarningType = '1a_ADVERTENCIA' | '2a_ADVERTENCIA' | 'DESLIGAMENTO';

// ── Tasks: Requests & Responses ──────────────────────────────

export interface CreateTaskRequest {
  setor_id: string; // UUID
  titulo: string;
  descricao?: string | null;
  prazo_conclusao?: string | null; // YYYY-MM-DD
}

export interface UpdateTaskRequest {
  titulo?: string | null;
  descricao?: string | null;
}

export interface UpdateTaskPrazoRequest {
  prazo_conclusao: string; // YYYY-MM-DD
}

export interface TaskResponse {
  id: string; // UUID da task
  usuario_id: string; // UUID do dono da task
  setor_id: string; // UUID do setor
  origem_task_id: string | null; // UUID da task original quando clonada
  titulo: string;
  descricao: string | null;
  status: TaskStatus;
  prazo_conclusao: string | null; // YYYY-MM-DD
  entrada_auditoria_em: string | null; // ISO 8601
  criado_em: string; // ISO 8601
  atualizado_em: string; // ISO 8601
}

export interface TaskListResponse {
  tasks: TaskResponse[];
  total: number;
  pagina: number;
  limite: number;
}

// ── Weekly Task Items (Vínculo da task com a weekly) ──────────

export interface AddWeeklyTaskRequest {
  task_id?: string | null;
  titulo?: string | null;
  descricao?: string | null;
  prazo_conclusao?: string | null; // YYYY-MM-DD
}

export interface UpdateWeeklyTaskRequest {
  concluida?: boolean;
  impedimento?: string | null;
}

export interface WeeklyTaskItemResponse {
  id: string; // UUID do vínculo weekly_task (usado em W10/W11)
  task_id: string; // UUID da task propriamente dita (usado em T03-T08)
  titulo: string;
  descricao: string | null;
  status_task: TaskStatus;
  prazo_conclusao: string | null; // YYYY-MM-DD
  concluida: boolean; // Conclusão nesta semana específica
  impedimento: string | null;
  posicao: number;
  origem: WeeklyTaskOrigem;
}

// ── Weeklies: Requests & Responses ───────────────────────────

export interface CreateWeeklyRequest {
  setor_id: string;
  semana_referencia?: string | null; // YYYY-MM-DD (Segunda-feira de fechamento)
}

export interface WeeklyResponse {
  id: string;
  usuario_id: string;
  membro_nome: string | null;
  setor_id: string;
  semana_referencia: string; // YYYY-MM-DD
  status: WeeklyStatus;
  enviada_em: string | null;
  avaliada_em: string | null;
  avaliada_por: string | null;
  observacao_lider: string | null;
  motivo_expiracao: string | null;
  detalhe_expiracao: string | null;
  criado_em: string;
  atualizado_em: string;
  tasks: WeeklyTaskItemResponse[];
}

export interface WeeklySummaryResponse {
  id: string;
  usuario_id: string;
  membro_nome: string | null;
  setor_id: string;
  semana_referencia: string; // YYYY-MM-DD
  status: WeeklyStatus;
  enviada_em: string | null;
  total_tasks: number;
  total_concluidas: number;
  total_impedimentos: number;
  motivo_expiracao: string | null;
  criado_em: string;
}

export interface WeeklyListResponse {
  weeklies: WeeklySummaryResponse[];
  total: number;
  pagina: number;
  limite: number;
}

export interface EvaluateWeeklyRequest {
  status: 'APROVADA' | 'REJEITADA';
  observacao_lider?: string | null;
}

// ── Atribuições / Convites de Colaboração (C01-C03) ──────────

export interface CreateTaskAssignmentRequest {
  atribuido_id: string;
}

export interface TaskAssignmentResponse {
  id: string;
  task_id: string;
  task_titulo: string | null;
  solicitante_id: string;
  solicitante_nome: string | null;
  atribuido_id: string;
  atribuido_nome: string | null;
  status: AssignmentStatus;
  criado_em: string;
  respondido_em: string | null;
}

export interface TaskAssignmentListResponse {
  atribuicoes: TaskAssignmentResponse[];
  total: number;
  pagina: number;
  limite: number;
}

export interface EligibleCollaborator {
  id: string;
  nome_completo: string;
  email: string;
  matricula: string;
  setores: string[];
}

export interface EligibleCollaboratorsResponse {
  colaboradores: EligibleCollaborator[];
  total: number;
  pagina: number;
  limite: number;
}

// ── Advertências (A01-A02) ───────────────────────────────────

export interface WeeklyWarningResponse {
  id: string;
  usuario_id: string;
  usuario_nome: string | null;
  setor_id: string;
  setor_nome: string | null;
  tipo: WarningType;
  semana_referencia: string; // YYYY-MM-DD
  semanas_ausentes: number;
  criado_em: string;
}

export interface WeeklyWarningListResponse {
  advertencias: WeeklyWarningResponse[];
  total: number;
  pagina: number;
  limite: number;
}

// ── Dashboards (D01-D02) ────────────────────────────────────

export interface SectorDashboardResponse {
  setor_id: string;
  setor_nome: string;
  semana_referencia: string; // YYYY-MM-DD
  total_membros: number;
  weeklies_enviadas: number;
  weeklies_aprovadas: number;
  weeklies_rejeitadas: number;
  weeklies_expiradas: number;
  weeklies_rascunho: number;
  taxa_submissao_percentual: number;
  total_tasks: number;
  tasks_concluidas: number;
  tasks_pendentes: number;
  tasks_em_auditoria: number;
  total_impedimentos: number;
}

export interface GlobalDashboardResponse {
  semana_referencia: string; // YYYY-MM-DD
  total_setores: number;
  total_membros: number;
  total_weeklies_enviadas: number;
  total_weeklies_aprovadas: number;
  total_weeklies_rejeitadas: number;
  total_weeklies_expiradas: number;
  total_weeklies_rascunho: number;
  taxa_submissao_geral_percentual: number;
  total_tasks_em_auditoria: number;
  total_impedimentos: number;
  setores: SectorDashboardResponse[];
}

export interface ActionMessageResponse {
  mensagem: string;
}

// ── Legado / Compatibilidade temporária ───────────────────────
// Mantidos enquanto as telas existentes são refatoradas nas etapas seguintes.
export type WeeklyType = 'current' | 'past';
export type LegacyTaskStatus = 'pending' | 'blocked' | 'done';
export type LegacyWeeklyStatus = 'planning' | 'in_progress' | 'closed';

export interface WeeklyTask {
  id: string;
  weekly_id: string;
  carried_over_from_id?: string;
  type: WeeklyType;
  status: LegacyTaskStatus;
  content: string;
  project_name?: string;
}

export interface Weekly {
  id: string;
  sector_member_id: string;
  status: LegacyWeeklyStatus;
  date_week: string;
  submitted_at: string;
  tasks?: WeeklyTask[];
}
