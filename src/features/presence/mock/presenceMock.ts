import { useCallback, useEffect, useState } from 'react';

export interface MockMeetingRecord {
  id: string;
  titulo: string;
  data: string;
  horario: string;
  status: 'PRESENTE' | 'AUSENTE';
  confirmadaEm?: string | null;
}

export interface MockActiveMeeting {
  id: string;
  titulo: string;
  horario: string;
  palavraChave: string;
  isChamadaAberta: boolean;
  jaConfirmou: boolean;
  confirmadaEm: string | null;
  confirmadaDataIso: string | null;
}

interface MockPresenceState {
  activeMeeting: MockActiveMeeting;
  pastMeetings: MockMeetingRecord[];
}

const STORAGE_KEY = 'prismall_presence_mock_v1';

const INITIAL_PAST_MEETINGS: MockMeetingRecord[] = [
  {
    id: 'meet-8',
    titulo: 'Reunião Geral Quinzenal #08',
    data: '05/11/2026',
    horario: '18:30',
    status: 'PRESENTE',
    confirmadaEm: '18:34',
  },
  {
    id: 'meet-7',
    titulo: 'Alinhamento de Ciclo & Sprints',
    data: '22/10/2026',
    horario: '18:30',
    status: 'PRESENTE',
    confirmadaEm: '18:31',
  },
  {
    id: 'meet-6',
    titulo: 'Reunião Geral Quinzenal #07',
    data: '08/10/2026',
    horario: '18:30',
    status: 'AUSENTE',
    confirmadaEm: null,
  },
  {
    id: 'meet-5',
    titulo: 'Reunião Geral Quinzenal #06',
    data: '24/09/2026',
    horario: '18:30',
    status: 'PRESENTE',
    confirmadaEm: '18:35',
  },
  {
    id: 'meet-4',
    titulo: 'Kickoff Semestral LearningLab',
    data: '10/09/2026',
    horario: '18:30',
    status: 'PRESENTE',
    confirmadaEm: '18:29',
  },
];

function createInitialState(): MockPresenceState {
  return {
    activeMeeting: {
      id: 'meet-current',
      titulo: 'Reunião Geral Quinzenal #09',
      horario: 'Hoje, 18:30',
      palavraChave: 'learninglab',
      isChamadaAberta: true,
      jaConfirmou: false,
      confirmadaEm: null,
      confirmadaDataIso: null,
    },
    pastMeetings: INITIAL_PAST_MEETINGS,
  };
}

function loadState(): MockPresenceState {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as MockPresenceState;
    if (parsed?.activeMeeting && Array.isArray(parsed?.pastMeetings)) {
      return parsed;
    }
  } catch {
    // Fallback silencioso para memória
  }
  return createInitialState();
}

let storeState: MockPresenceState = loadState();
const listeners = new Set<() => void>();

function persistAndNotify(next: MockPresenceState) {
  storeState = next;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignora caso sessionStorage não esteja disponível
  }
  listeners.forEach(listener => listener());
}

export function resetMockPresenceStore() {
  persistAndNotify(createInitialState());
}

/**
 * Hook de demonstração (mock) para chamadas e histórico de reuniões
 * enquanto o módulo de presença no backend não é implementado.
 */
export function useMockPresence() {
  const [state, setState] = useState<MockPresenceState>(() => storeState);

  useEffect(() => {
    const onChange = () => {
      setState(storeState);
    };
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const confirmPresence = useCallback(
    async (
      keyword: string,
      confirmationDate: Date = new Date(),
    ): Promise<{ ok: boolean; error?: string }> => {
      const normalized = keyword.trim().toLowerCase();
      if (!normalized) {
        return { ok: false, error: 'A palavra-chave é obrigatória.' };
      }

      if (!storeState.activeMeeting.isChamadaAberta) {
        return {
          ok: false,
          error: 'Nenhuma chamada aberta no momento.',
        };
      }

      if (normalized !== storeState.activeMeeting.palavraChave) {
        return {
          ok: false,
          error: 'Palavra-chave incorreta. Digite "learninglab".',
        };
      }

      const confirmadaEm = confirmationDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      persistAndNotify({
        ...storeState,
        activeMeeting: {
          ...storeState.activeMeeting,
          jaConfirmou: true,
          confirmadaEm,
          confirmadaDataIso: confirmationDate.toISOString(),
        },
      });

      return { ok: true };
    },
    [],
  );

  const toggleChamadaAberta = useCallback(() => {
    persistAndNotify({
      ...storeState,
      activeMeeting: {
        ...storeState.activeMeeting,
        isChamadaAberta: !storeState.activeMeeting.isChamadaAberta,
      },
    });
  }, []);

  const resetMock = useCallback(() => {
    resetMockPresenceStore();
  }, []);

  const history: MockMeetingRecord[] = state.activeMeeting.jaConfirmou
    ? [
        {
          id: state.activeMeeting.id,
          titulo: state.activeMeeting.titulo,
          data: state.activeMeeting.confirmadaDataIso
            ? new Date(
                state.activeMeeting.confirmadaDataIso,
              ).toLocaleDateString('pt-BR')
            : new Date().toLocaleDateString('pt-BR'),
          horario: '18:30',
          status: 'PRESENTE',
          confirmadaEm: state.activeMeeting.confirmadaEm,
        },
        ...state.pastMeetings,
      ]
    : state.pastMeetings;

  const recentHistory = history.slice(0, 3);
  const totalReunioes = history.length;
  const totalPresencas = history.filter(m => m.status === 'PRESENTE').length;
  const taxaPercentual =
    totalReunioes > 0 ? Math.round((totalPresencas / totalReunioes) * 100) : 0;

  return {
    activeMeeting: state.activeMeeting,
    history,
    recentHistory,
    stats: {
      totalReunioes,
      totalPresencas,
      taxaPercentual,
    },
    confirmPresence,
    toggleChamadaAberta,
    resetMock,
  };
}
