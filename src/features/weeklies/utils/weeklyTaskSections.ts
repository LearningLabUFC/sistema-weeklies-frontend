import type { WeeklyTaskItemResponse } from '@/types/weeklies';

export type HerdadaDecisionMap = Record<string, 'concluida' | 'nao_concluida'>;

export interface PartitionedWeeklyTasks {
  /** Tarefas da Seção 1: herdadas do ciclo anterior, concluídas ou com impedimento. */
  retrospectiveTasks: WeeklyTaskItemResponse[];
  /** Tarefas da Seção 1 ainda não concluídas, espelhadas automaticamente na Seção 2. */
  uncompletedRetrospectiveTasks: WeeklyTaskItemResponse[];
  /** Tarefas da Seção 2: novas tarefas planejadas para o ciclo atual. */
  plannedTasks: WeeklyTaskItemResponse[];
}

/**
 * Determina o estado de revisão de uma tarefa herdada no formulário editável.
 */
export function getHerdadaReviewDecision(
  taskItem: WeeklyTaskItemResponse,
  herdadaReviewDecisions: HerdadaDecisionMap,
): 'concluida' | 'nao_concluida' | 'pendente' {
  if (taskItem.concluida) return 'concluida';
  const explicit = herdadaReviewDecisions[taskItem.id];
  if (explicit) return explicit;
  if (taskItem.impedimento) return 'nao_concluida';
  return 'pendente';
}

/**
 * Divide os itens de uma weekly entre retrospectiva da semana anterior e
 * planejamento do ciclo atual, calculando o espelho de pendências.
 */
export function partitionWeeklyTasks(
  tasks: WeeklyTaskItemResponse[],
  herdadaReviewDecisions?: HerdadaDecisionMap,
): PartitionedWeeklyTasks {
  const retrospectiveTasks = tasks.filter(
    t => t.origem === 'HERDADA' || t.concluida || Boolean(t.impedimento),
  );
  const uncompletedRetrospectiveTasks = retrospectiveTasks.filter(t => {
    if (t.concluida) return false;
    if (!herdadaReviewDecisions) return true;
    return (
      t.origem !== 'HERDADA' ||
      herdadaReviewDecisions[t.id] === 'nao_concluida' ||
      Boolean(t.impedimento)
    );
  });
  const plannedTasks = tasks.filter(
    t => t.origem === 'NOVA' && !t.concluida && !t.impedimento,
  );

  return {
    retrospectiveTasks,
    uncompletedRetrospectiveTasks,
    plannedTasks,
  };
}
