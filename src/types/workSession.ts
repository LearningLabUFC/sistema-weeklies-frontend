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

export interface WorkSession {
  id: string;
  usuario_id: string;
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
}

export interface WorkSessionSummaryResponse {
  usuario_id: string;
  inicio: string; // ISO 8601 TIMESTAMPTZ
  fim: string; // ISO 8601 TIMESTAMPTZ
  tempo_trabalhado_segundos: number;
}

export interface GetWorkSessionsParams {
  usuario_id?: string;
  inicio?: string; // ISO 8601 com fuso
  fim?: string; // ISO 8601 com fuso
}

export interface GetWorkSessionSummaryParams {
  usuario_id?: string;
  inicio: string; // ISO 8601 com fuso (obrigatório, início < fim)
  fim: string; // ISO 8601 com fuso (obrigatório)
}
