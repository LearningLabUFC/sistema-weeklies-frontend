/**
 * Tipos e Enums para o Módulo de Controle de Horas (WorkSession)
 * Baseado na Proposta de Arquitetura do LearningLab.
 */

export type WorkSessionStatus =
  | 'ATIVA'
  | 'EM_PAUSA'
  | 'FINALIZADA'
  | 'EXPIRADA_SISTEMA';

export type MotivoEncerramento = 'MANUAL' | 'LIMITE_ATINGIDO' | null;

export interface Pause {
  id: string;
  sessao_id: string;
  inicio_em: string; // ISO 8601 TIMESTAMPTZ
  fim_em: string | null; // ISO 8601 TIMESTAMPTZ ou null enquanto a pausa estiver aberta
}

export interface StartWorkSessionRequest {
  setor_id: string;
}

export interface WorkSession {
  id: string;
  usuario_id: string;
  setor_id: string;
  entrada_em: string; // ISO 8601 TIMESTAMPTZ
  saida_em: string | null; // ISO 8601 TIMESTAMPTZ ou null enquanto aberta
  expira_em: string; // ISO 8601 TIMESTAMPTZ (8 horas após a entrada)
  status: WorkSessionStatus;
  motivo_encerramento: MotivoEncerramento;
  tempo_trabalhado_segundos: number; // Calculado pelo backend sob demanda
}

export interface WorkSessionDetail extends WorkSession {
  pausas: Pause[];
}

export interface CurrentWorkSessionResponse {
  sessao: WorkSessionDetail | null;
}

export interface WorkSessionsHistoryResponse {
  sessoes: WorkSession[];
  total: number;
  pagina: number;
  limite: number;
}

export interface WorkSessionSummaryResponse {
  usuario_id?: string | null;
  setor_id?: string | null;
  inicio: string; // ISO 8601 TIMESTAMPTZ
  fim: string; // ISO 8601 TIMESTAMPTZ
  tempo_trabalhado_segundos: number;
}

export interface GetWorkSessionsParams {
  usuario_id?: string;
  setor_id?: string;
  status?: WorkSessionStatus;
  inicio?: string; // ISO 8601 com fuso
  fim?: string; // ISO 8601 com fuso
  pagina?: number;
  limite?: number;
}

export interface GetWorkSessionSummaryParams {
  usuario_id?: string;
  setor_id?: string;
  inicio: string; // ISO 8601 com fuso (obrigatório, início < fim)
  fim: string; // ISO 8601 com fuso (obrigatório)
}

export interface MetricsSummaryResponse {
  inicio: string; // ISO 8601 TIMESTAMPTZ
  fim: string; // ISO 8601 TIMESTAMPTZ
  usuario_id?: string | null;
  setor_id?: string | null;
  tempo_trabalhado_segundos: number;
  tempo_pausado_segundos: number;
  sessoes_iniciadas: number;
  usuarios_com_tempo_trabalhado: number;
}

export interface GetMetricsSummaryParams {
  inicio: string; // ISO 8601 com fuso (obrigatório, início < fim)
  fim: string; // ISO 8601 com fuso (obrigatório)
  usuario_id?: string;
  setor_id?: string;
}

export interface MetricsUserItem {
  usuario_id: string; // UUID
  nome_completo: string;
  tempo_trabalhado_segundos: number;
  tempo_pausado_segundos: number;
  sessoes_iniciadas: number;
}

export interface MetricsUsersResponse {
  inicio: string; // ISO 8601 TIMESTAMPTZ
  fim: string; // ISO 8601 TIMESTAMPTZ
  pagina: number;
  limite: number;
  total: number;
  usuarios: MetricsUserItem[];
}

export interface GetMetricsUsersParams {
  inicio: string; // ISO 8601 com fuso (obrigatório, início < fim)
  fim: string; // ISO 8601 com fuso (obrigatório)
  usuario_id?: string;
  setor_id?: string;
  pagina?: number;
  limite?: number;
}

export interface MetricsSectorItem {
  setor_id: string; // UUID
  setor_nome: string;
  tempo_trabalhado_segundos: number;
  tempo_pausado_segundos: number;
  sessoes_iniciadas: number;
  usuarios_com_tempo_trabalhado: number;
}

export interface MetricsSectorsResponse {
  inicio: string; // ISO 8601 TIMESTAMPTZ
  fim: string; // ISO 8601 TIMESTAMPTZ
  pagina: number;
  limite: number;
  total: number;
  setores: MetricsSectorItem[];
}

export interface GetMetricsSectorsParams {
  inicio: string; // ISO 8601 com fuso (obrigatório, início < fim)
  fim: string; // ISO 8601 com fuso (obrigatório)
  usuario_id?: string;
  setor_id?: string;
  pagina?: number;
  limite?: number;
}

export type TimelineGrouping = 'dia' | 'semana' | 'mes';

export interface TimelineIntervalItem {
  inicio: string; // ISO 8601 TIMESTAMPTZ
  fim: string; // ISO 8601 TIMESTAMPTZ
  tempo_trabalhado_segundos: number;
  tempo_pausado_segundos: number;
}

export interface MetricsTimelineResponse {
  inicio: string; // ISO 8601 TIMESTAMPTZ
  fim: string; // ISO 8601 TIMESTAMPTZ
  agrupamento: TimelineGrouping;
  fuso: string;
  intervalos: TimelineIntervalItem[];
}

export interface GetMetricsTimelineParams {
  inicio: string; // ISO 8601 com fuso (obrigatório, início < fim)
  fim: string; // ISO 8601 com fuso (obrigatório)
  usuario_id?: string;
  setor_id?: string;
  agrupamento?: TimelineGrouping;
}
