export interface WeeklyProject {
  id: string;
  project: string;
  lastWeek: string;
  nextWeek: string;
  hasBlockers: boolean;
  blockers: string;
  lastWeekTasks: WeeklyTask[];
  nextWeekTasks: WeeklyTask[];
}

export interface WeeklyTask {
  id: string;
  content: string;
  completed: boolean;
  hasBlocker: boolean;
  blockerReason: string;
}

export const MOCK_PROJECTS: WeeklyProject[] = [
  {
    id: 'project-gamificall',
    project: 'Gamificall',
    lastWeek: '',
    nextWeek: '',
    hasBlockers: false,
    blockers: '',
    lastWeekTasks: [
      {
        id: 'gamificall-last-1',
        content: 'Revisar o fluxo principal do produto',
        completed: true,
        hasBlocker: false,
        blockerReason: '',
      },
      {
        id: 'gamificall-last-2',
        content: 'Validar os ajustes com o time',
        completed: false,
        hasBlocker: false,
        blockerReason: '',
      },
    ],
    nextWeekTasks: [],
  },
  {
    id: 'project-llabux',
    project: 'LLabUX',
    lastWeek: '',
    nextWeek: '',
    hasBlockers: false,
    blockers: '',
    lastWeekTasks: [
      {
        id: 'llabux-last-1',
        content: 'Realizar entrevistas com usuários',
        completed: false,
        hasBlocker: false,
        blockerReason: '',
      },
      {
        id: 'llabux-last-2',
        content: 'Organizar os insights da pesquisa',
        completed: false,
        hasBlocker: false,
        blockerReason: '',
      },
    ],
    nextWeekTasks: [],
  },
  {
    id: 'project-processos',
    project: 'Processos',
    lastWeek: '',
    nextWeek: '',
    hasBlockers: false,
    blockers: '',
    lastWeekTasks: [
      {
        id: 'processos-last-1',
        content: 'Mapear o processo atual de atendimento',
        completed: false,
        hasBlocker: false,
        blockerReason: '',
      },
      {
        id: 'processos-last-2',
        content: 'Documentar as etapas do novo fluxo',
        completed: false,
        hasBlocker: true,
        blockerReason: 'Aguardando as regras atualizadas do setor financeiro.',
      },
    ],
    nextWeekTasks: [],
  },
  {
    id: 'project-gestllab',
    project: 'GestLLab',
    lastWeek: '',
    nextWeek: '',
    hasBlockers: false,
    blockers: '',
    lastWeekTasks: [
      {
        id: 'gestllab-last-1',
        content: 'Atualizar a documentação do projeto',
        completed: false,
        hasBlocker: false,
        blockerReason: '',
      },
      {
        id: 'gestllab-last-2',
        content: 'Revisar as pendências do time',
        completed: false,
        hasBlocker: false,
        blockerReason: '',
      },
      {
        id: 'gestllab-last-3',
        content: 'Preparar o relatório de acompanhamento',
        completed: true,
        hasBlocker: false,
        blockerReason: '',
      },
    ],
    nextWeekTasks: [],
  },
];
