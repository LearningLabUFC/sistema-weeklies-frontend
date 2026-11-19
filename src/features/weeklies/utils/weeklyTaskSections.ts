import type { WeeklyTaskItemResponse } from '@/types/weeklies';

export type HerdadaDecisionMap = Record<string, 'concluida' | 'nao_concluida'>;

export interface PartitionedWeeklyTasks {
  /** Tarefas da Seção 1: entregas realizadas na semana anterior (concluídas)
   * ou tarefas herdadas ainda pendentes de revisão.
   * Quando uma tarefa herdada é marcada como não concluída, ela é ocultada desta seção.
   */
  retrospectiveTasks: WeeklyTaskItemResponse[];
  /** Tarefas do ciclo anterior não concluídas (herdadas marcadas como não concluídas ou em aberto),
   * exibidas na Seção 2 como continuação.
   */
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
 * planejamento do ciclo atual.
 *
 * Regra visual:
 * - Tarefas não concluídas do ciclo anterior não aparecem na Seção 1 ("O que fiz na semana anterior"),
 *   pois o usuário não as fez. Elas são ocultadas da Seção 1 e exibidas na Seção 2 ("O que farei nesta semana").
 * - Na Seção 1 permanecem apenas tarefas efetivamente concluídas e tarefas herdadas aguardando revisão.
 */
export function partitionWeeklyTasks(
  tasks: WeeklyTaskItemResponse[],
  herdadaReviewDecisions?: HerdadaDecisionMap,
): PartitionedWeeklyTasks {
  const safeTasks = (tasks || []).filter(Boolean);

  if (herdadaReviewDecisions) {
    // Modo editável / interativo:
    const retrospectiveTasks = safeTasks.filter(t => {
      if (!t) return false;
      if (t.origem === 'HERDADA') {
        const decision = getHerdadaReviewDecision(t, herdadaReviewDecisions);
        // Só permanece na Seção 1 se concluída ou pendente de revisão
        return decision === 'concluida' || decision === 'pendente';
      }
      // Novas tarefas só aparecem na Seção 1 se foram marcadas como entrega realizada retroativa
      return Boolean(t.concluida);
    });

    const uncompletedRetrospectiveTasks = safeTasks.filter(t => {
      if (!t) return false;
      if (t.origem === 'HERDADA') {
        const decision = getHerdadaReviewDecision(t, herdadaReviewDecisions);
        return decision === 'nao_concluida';
      }
      return false;
    });

    const plannedTasks = safeTasks.filter(
      t => Boolean(t) && t.origem === 'NOVA' && !t.concluida && !t.impedimento,
    );

    return {
      retrospectiveTasks,
      uncompletedRetrospectiveTasks,
      plannedTasks,
    };
  }

  // Modo somente leitura (resumo, visualização pós-submissão e avaliação do líder):
  // Seção 1: estritamente o que foi concluído
  const retrospectiveTasks = safeTasks.filter(t => Boolean(t?.concluida));

  // Seção 2: tarefas herdadas não concluídas (continuação)
  const uncompletedRetrospectiveTasks = safeTasks.filter(
    t =>
      Boolean(t) &&
      ((t.origem === 'HERDADA' && !t.concluida) ||
        (!t.concluida && Boolean(t.impedimento))),
  );

  const plannedTasks = safeTasks.filter(
    t => Boolean(t) && t.origem === 'NOVA' && !t.concluida && !t.impedimento,
  );

  return {
    retrospectiveTasks,
    uncompletedRetrospectiveTasks,
    plannedTasks,
  };
}
