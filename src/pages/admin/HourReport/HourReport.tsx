import {
  AlertCircle,
  BarChart3,
  Briefcase,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Eye,
  Filter,
  Layers,
  Percent,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
  User as UserIcon,
  Users,
  UserX,
  X,
} from 'lucide-react';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Header from '@/components/layout/Header/Header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SectorContext } from '@/features/sectors/context/sectorContextDef';
import { SessionDetailModal } from '@/features/workSession/components/SessionDetailModal';
import { SessionHistoryCollapsible } from '@/features/workSession/components/SessionHistoryCollapsible';
import { SessionSummaryCollapsible } from '@/features/workSession/components/SessionSummaryCollapsible';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { api } from '@/lib/api';
import { workSessionService } from '@/services/workSessionService';
import type {
  GetMetricsSectorsParams,
  GetMetricsSummaryParams,
  GetMetricsTimelineParams,
  GetMetricsUsersParams,
  MetricsSectorsResponse,
  MetricsSummaryResponse,
  MetricsTimelineResponse,
  MetricsUserItem,
  MetricsUsersResponse,
  TimelineGrouping,
} from '@/types/workSession';

type PeriodPreset = 'week' | 'month' | 'last30' | 'custom';

interface SystemUserOption {
  id: string;
  nome_completo: string;
  email?: string;
  role_nome?: string;
  setor_nome?: string;
}

function isEligibleHoursRole(role?: string): boolean {
  if (!role) return true;
  const normalized = role.toLowerCase().trim();
  return normalized !== 'admin' && normalized !== 'super_admin';
}

function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function formatDateLabel(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

function formatSessionDate(isoString?: string | null): string {
  if (!isoString) return '--/--/----';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

function formatSessionTime(isoString?: string | null): string {
  if (!isoString) return '--:--';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

function formatTimelineIntervalLabel(
  inicioIso: string,
  fimIso: string,
  agrupamento: TimelineGrouping,
): { primary: string; secondary?: string } {
  try {
    const start = new Date(inicioIso);
    if (agrupamento === 'dia') {
      const day = start.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
      const weekday = start.toLocaleDateString('pt-BR', { weekday: 'short' });
      return { primary: day, secondary: weekday };
    }
    if (agrupamento === 'semana') {
      const end = new Date(fimIso);
      const startStr = start.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
      const endStr = end.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
      return { primary: `${startStr} - ${endStr}` };
    }
    if (agrupamento === 'mes') {
      const monthStr = start.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      });
      return { primary: monthStr };
    }
  } catch {
    return { primary: inicioIso.slice(0, 10) };
  }
  return { primary: inicioIso.slice(0, 10) };
}

function getUserInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getWeekPresetRange(): { inicio: string; fim: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    inicio: monday.toISOString(),
    fim: sunday.toISOString(),
  };
}

function getMonthPresetRange(): { inicio: string; fim: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const lastDay = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return {
    inicio: firstDay.toISOString(),
    fim: lastDay.toISOString(),
  };
}

function getLast30DaysPresetRange(): { inicio: string; fim: string } {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  return {
    inicio: thirtyDaysAgo.toISOString(),
    fim: now.toISOString(),
  };
}

function toDateInputFormat(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const HourReport = () => {
  const sectorContext = useContext(SectorContext);
  const sectors = sectorContext?.sectors ?? [];
  const mySectors = sectorContext?.mySectors ?? [];
  const availableSectors = sectors.length > 0 ? sectors : mySectors;

  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('week');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');
  const [isUserSuggestionsOpen, setIsUserSuggestionsOpen] =
    useState<boolean>(false);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const [systemUsers, setSystemUsers] = useState<SystemUserOption[]>([]);
  const [usersPage, setUsersPage] = useState<number>(1);
  const [sectorsPage, setSectorsPage] = useState<number>(1);
  const [timelineGrouping, setTimelineGrouping] =
    useState<TimelineGrouping>('dia');

  // Modal de detalhamento de sessões por colaborador
  const [inspectedUser, setInspectedUser] = useState<MetricsUserItem | null>(
    null,
  );

  // Modal para inspeção profunda de pausas de uma sessão específica
  const [modalSessionId, setModalSessionId] = useState<string | null>(null);

  // Default custom range: 7 days ago to today
  const [customInicio, setCustomInicio] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toDateInputFormat(d);
  });
  const [customFim, setCustomFim] = useState<string>(() =>
    toDateInputFormat(new Date()),
  );

  // Carrega lista de colaboradores ativos elegíveis para o seletor por nome (exclui admin e super_admin)
  useEffect(() => {
    let isMounted = true;
    const loadSystemUsers = async () => {
      try {
        const res = await api.get<{ usuarios?: SystemUserOption[] }>(
          '/admin/users?status=ativo&role=usuario&limite=100',
        );
        if (isMounted && res.data?.usuarios) {
          const eligibleUsers = res.data.usuarios.filter(u =>
            isEligibleHoursRole(u.role_nome),
          );
          setSystemUsers(eligibleUsers);
        }
      } catch {
        // Fallback gracioso: usará os colaboradores retornados por metricsUsers
      }
    };
    void loadSystemUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fecha o dropdown flutuante de sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        autocompleteContainerRef.current &&
        !autocompleteContainerRef.current.contains(event.target as Node)
      ) {
        setIsUserSuggestionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Helper to compute active date boundaries
  const computeActiveRange = useCallback((): {
    inicio: string;
    fim: string;
  } => {
    if (periodPreset === 'week') return getWeekPresetRange();
    if (periodPreset === 'month') return getMonthPresetRange();
    if (periodPreset === 'last30') return getLast30DaysPresetRange();

    if (!customInicio || !customFim) {
      throw new Error('Por favor, informe a data inicial e a data final.');
    }
    const start = new Date(`${customInicio}T00:00:00`);
    const end = new Date(`${customFim}T23:59:59.999`);
    if (start >= end) {
      throw new Error('A data inicial deve ser anterior à data final.');
    }
    return {
      inicio: start.toISOString(),
      fim: end.toISOString(),
    };
  }, [periodPreset, customInicio, customFim]);

  // 1. Query for Executive Metrics Summary (GET /work-sessions/metrics/summary)
  const fetchSummaryQuery =
    useCallback(async (): Promise<MetricsSummaryResponse> => {
      const range = computeActiveRange();
      const params: GetMetricsSummaryParams = {
        inicio: range.inicio,
        fim: range.fim,
        setor_id: selectedSectorId !== 'all' ? selectedSectorId : undefined,
        usuario_id: selectedUserId.trim() ? selectedUserId.trim() : undefined,
      };
      return workSessionService.getMetricsSummary(params);
    }, [computeActiveRange, selectedSectorId, selectedUserId]);

  const {
    data: metrics,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useAsyncQuery(fetchSummaryQuery);

  // 2. Query for User-Level Metrics Table (GET /work-sessions/metrics/users)
  const fetchUsersQuery =
    useCallback(async (): Promise<MetricsUsersResponse> => {
      const range = computeActiveRange();
      const params: GetMetricsUsersParams = {
        inicio: range.inicio,
        fim: range.fim,
        setor_id: selectedSectorId !== 'all' ? selectedSectorId : undefined,
        usuario_id: selectedUserId.trim() ? selectedUserId.trim() : undefined,
        pagina: usersPage,
        limite: 10,
      };
      return workSessionService.getMetricsUsers(params);
    }, [computeActiveRange, selectedSectorId, selectedUserId, usersPage]);

  const {
    data: usersMetrics,
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useAsyncQuery(fetchUsersQuery);

  // 3. Query for Sector-Level Metrics Table (GET /work-sessions/metrics/sectors)
  const fetchSectorsQuery =
    useCallback(async (): Promise<MetricsSectorsResponse> => {
      const range = computeActiveRange();
      const params: GetMetricsSectorsParams = {
        inicio: range.inicio,
        fim: range.fim,
        setor_id: selectedSectorId !== 'all' ? selectedSectorId : undefined,
        usuario_id: selectedUserId.trim() ? selectedUserId.trim() : undefined,
        pagina: sectorsPage,
        limite: 10,
      };
      return workSessionService.getMetricsSectors(params);
    }, [computeActiveRange, selectedSectorId, selectedUserId, sectorsPage]);

  const {
    data: sectorsMetrics,
    isLoading: isSectorsLoading,
    error: sectorsError,
    refetch: refetchSectors,
  } = useAsyncQuery(fetchSectorsQuery);

  // 4. Query for Timeline Metrics (GET /work-sessions/metrics/timeline)
  const fetchTimelineQuery =
    useCallback(async (): Promise<MetricsTimelineResponse> => {
      const range = computeActiveRange();
      const params: GetMetricsTimelineParams = {
        inicio: range.inicio,
        fim: range.fim,
        setor_id: selectedSectorId !== 'all' ? selectedSectorId : undefined,
        usuario_id: selectedUserId.trim() ? selectedUserId.trim() : undefined,
        agrupamento: timelineGrouping,
      };
      return workSessionService.getMetricsTimeline(params);
    }, [
      computeActiveRange,
      selectedSectorId,
      selectedUserId,
      timelineGrouping,
    ]);

  const {
    data: timelineMetrics,
    isLoading: isTimelineLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useAsyncQuery(fetchTimelineQuery);

  // 5. Query para histórico de sessões do colaborador inspecionado no modal
  const fetchInspectedSessionsQuery = useCallback(async () => {
    if (!inspectedUser) return null;
    const range = computeActiveRange();
    return workSessionService.getHistory({
      usuario_id: inspectedUser.usuario_id,
      inicio: range.inicio,
      fim: range.fim,
      limite: 50,
    });
  }, [inspectedUser, computeActiveRange]);

  const {
    data: inspectedSessionsData,
    isLoading: isLoadingInspectedSessions,
    error: inspectedSessionsErrorObj,
  } = useAsyncQuery(fetchInspectedSessionsQuery, {
    enabled: Boolean(inspectedUser),
  });

  const inspectedUserSessions = inspectedSessionsData?.sessoes || [];
  const inspectedSessionsError = inspectedSessionsErrorObj?.message || null;

  // Lista unificada de colaboradores conhecidos para busca e seleção por nome (apenas elegíveis)
  const allKnownUsers = useMemo(() => {
    const map = new Map<string, SystemUserOption>();
    for (const u of systemUsers) {
      if (isEligibleHoursRole(u.role_nome)) {
        map.set(u.id, u);
      }
    }
    if (usersMetrics?.usuarios) {
      for (const u of usersMetrics.usuarios) {
        if (!map.has(u.usuario_id)) {
          map.set(u.usuario_id, {
            id: u.usuario_id,
            nome_completo: u.nome_completo,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nome_completo.localeCompare(b.nome_completo),
    );
  }, [systemUsers, usersMetrics]);

  const selectedUserName = useMemo(() => {
    if (!selectedUserId) return null;
    const match = allKnownUsers.find(u => u.id === selectedUserId);
    return match ? match.nome_completo : selectedUserId;
  }, [selectedUserId, allKnownUsers]);

  // Filtra lista de colaboradores pelo termo digitado no autocomplete
  const filteredUsersList = useMemo(() => {
    const isShowingCurrentSelection =
      Boolean(selectedUserId) && userSearch === selectedUserName;
    if (!userSearch.trim() || isShowingCurrentSelection) {
      return allKnownUsers;
    }
    const term = userSearch.toLowerCase();
    return allKnownUsers.filter(
      u =>
        u.nome_completo.toLowerCase().includes(term) ||
        (u.email && u.email.toLowerCase().includes(term)),
    );
  }, [allKnownUsers, userSearch, selectedUserId, selectedUserName]);

  const handleRefreshAll = () => {
    void refetchSummary();
    void refetchTimeline();
    void refetchUsers();
    void refetchSectors();
  };

  const handlePresetChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    setUsersPage(1);
    setSectorsPage(1);
  };

  const handleSectorChange = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    setUsersPage(1);
    setSectorsPage(1);
  };

  const handleResetFilters = () => {
    setPeriodPreset('week');
    setSelectedSectorId('all');
    setSelectedUserId('');
    setUserSearch('');
    setIsUserSuggestionsOpen(false);
    setUsersPage(1);
    setSectorsPage(1);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserSearch(val);
    setIsUserSuggestionsOpen(true);
    if (!val.trim() && selectedUserId) {
      setSelectedUserId('');
      setUsersPage(1);
      setSectorsPage(1);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsUserSuggestionsOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredUsersList.length > 0) {
        handleSelectCollaborator(
          filteredUsersList[0].id,
          filteredUsersList[0].nome_completo,
        );
      }
    }
  };

  const handleSelectCollaborator = (userId: string, userName?: string) => {
    if (userId === 'all' || !userId) {
      setSelectedUserId('');
      setUserSearch('');
    } else {
      setSelectedUserId(userId);
      if (userName) {
        setUserSearch(userName);
      } else {
        const match = allKnownUsers.find(u => u.id === userId);
        if (match) setUserSearch(match.nome_completo);
      }
    }
    setIsUserSuggestionsOpen(false);
    setUsersPage(1);
    setSectorsPage(1);
  };

  // Calculations for productivity and executive averages
  const mediaPorColaboradorSegundos =
    metrics && metrics.usuarios_com_tempo_trabalhado > 0
      ? Math.round(
          metrics.tempo_trabalhado_segundos /
            metrics.usuarios_com_tempo_trabalhado,
        )
      : 0;

  const mediaPorSessaoSegundos =
    metrics && metrics.sessoes_iniciadas > 0
      ? Math.round(
          metrics.tempo_trabalhado_segundos / metrics.sessoes_iniciadas,
        )
      : 0;

  const totalBrutoSegundos = metrics
    ? metrics.tempo_trabalhado_segundos + metrics.tempo_pausado_segundos
    : 0;

  const taxaPausaPercentual =
    totalBrutoSegundos > 0 && metrics
      ? ((metrics.tempo_pausado_segundos / totalBrutoSegundos) * 100).toFixed(1)
      : '0.0';

  const horasTrabalhadasDec = metrics
    ? (metrics.tempo_trabalhado_segundos / 3600).toFixed(1)
    : '0.0';

  const horasPausadasDec = metrics
    ? (metrics.tempo_pausado_segundos / 3600).toFixed(1)
    : '0.0';

  const sectorName =
    selectedSectorId === 'all'
      ? 'Todos os setores'
      : (availableSectors.find(s => s.id === selectedSectorId)?.nome ??
        selectedSectorId);

  const getSectorNameById = (id?: string | null): string => {
    if (!id) return 'Sem setor';
    const match = availableSectors.find(s => s.id === id);
    return match ? match.nome : id;
  };

  const totalUsersPages = usersMetrics
    ? Math.max(1, Math.ceil(usersMetrics.total / usersMetrics.limite))
    : 1;

  const totalSectorsPages = sectorsMetrics
    ? Math.max(1, Math.ceil(sectorsMetrics.total / sectorsMetrics.limite))
    : 1;

  const generalError =
    summaryError || usersError || sectorsError || timelineError;
  const isGeneralLoading = isSummaryLoading && !metrics;

  return (
    <div
      className="w-full max-w-7xl mx-auto py-6 sm:py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      data-testid="admin-hour-report"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Relatório de Horas"
          subtitle="Painel executivo de dedicação, pausas e produtividade da organização"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={
              isSummaryLoading ||
              isUsersLoading ||
              isSectorsLoading ||
              isTimelineLoading
            }
            className="gap-2 rounded-xl h-9"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isSummaryLoading ||
                isUsersLoading ||
                isSectorsLoading ||
                isTimelineLoading
                  ? 'animate-spin'
                  : ''
              }`}
            />
            <span>Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-visible relative z-30">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-500" />
              <CardTitle className="text-base font-semibold">
                Filtros de Período e Escopo
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-8 px-2 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar Filtros
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4 overflow-visible">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              Período:
            </span>
            <Button
              type="button"
              size="sm"
              variant={periodPreset === 'week' ? 'default' : 'outline'}
              onClick={() => handlePresetChange('week')}
              className="h-8 text-xs rounded-lg"
            >
              Esta Semana
            </Button>
            <Button
              type="button"
              size="sm"
              variant={periodPreset === 'month' ? 'default' : 'outline'}
              onClick={() => handlePresetChange('month')}
              className="h-8 text-xs rounded-lg"
            >
              Este Mês
            </Button>
            <Button
              type="button"
              size="sm"
              variant={periodPreset === 'last30' ? 'default' : 'outline'}
              onClick={() => handlePresetChange('last30')}
              className="h-8 text-xs rounded-lg"
            >
              Últimos 30 Dias
            </Button>
            <Button
              type="button"
              size="sm"
              variant={periodPreset === 'custom' ? 'default' : 'outline'}
              onClick={() => handlePresetChange('custom')}
              className="h-8 text-xs rounded-lg"
            >
              Personalizado
            </Button>
          </div>

          {/* Custom Date Inputs (when 'custom' preset is active) */}
          {periodPreset === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 animate-in fade-in">
              <div className="space-y-1">
                <label
                  htmlFor="custom-inicio"
                  className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Data Inicial:
                </label>
                <Input
                  id="custom-inicio"
                  type="date"
                  value={customInicio}
                  onChange={e => {
                    setCustomInicio(e.target.value);
                    setUsersPage(1);
                  }}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="custom-fim"
                  className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Data Final:
                </label>
                <Input
                  id="custom-fim"
                  type="date"
                  value={customFim}
                  onChange={e => {
                    setCustomFim(e.target.value);
                    setUsersPage(1);
                  }}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          )}

          {/* Sector and Collaborator Name Filter row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Sector Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Setor:
              </label>
              <Select
                value={selectedSectorId}
                onValueChange={handleSectorChange}
              >
                <SelectTrigger className="h-9 text-xs rounded-xl">
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os setores</SelectItem>
                  {availableSectors.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Collaborator Autocomplete Search & Suggestions */}
            <div
              className="space-y-1.5 relative"
              ref={autocompleteContainerRef}
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="hour-report-user-search"
                  className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  Colaborador (opcional):
                </label>
                {selectedUserId && (
                  <button
                    type="button"
                    onClick={() => handleSelectCollaborator('all')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium cursor-pointer"
                  >
                    Limpar seleção
                  </button>
                )}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="hour-report-user-search"
                  role="combobox"
                  aria-expanded={isUserSuggestionsOpen}
                  aria-autocomplete="list"
                  aria-controls="collaborator-suggestions"
                  placeholder="Buscar colaborador por nome ou e-mail..."
                  value={userSearch}
                  onChange={handleSearchInputChange}
                  onFocus={e => {
                    setIsUserSuggestionsOpen(true);
                    if (selectedUserId) e.target.select();
                  }}
                  onKeyDown={handleSearchKeyDown}
                  className="h-9 pl-8 pr-8 text-xs rounded-xl"
                  autoComplete="off"
                  data-testid="collaborator-autocomplete-input"
                />
                {(userSearch || selectedUserId) && (
                  <button
                    type="button"
                    onClick={() => handleSelectCollaborator('all')}
                    aria-label="Limpar busca de colaborador"
                    data-testid="collaborator-autocomplete-clear"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Floating Suggestions Dropdown */}
                {isUserSuggestionsOpen && (
                  <div
                    id="collaborator-suggestions"
                    role="listbox"
                    aria-label="Sugestões de colaboradores"
                    data-testid="collaborator-suggestions-list"
                    className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={!selectedUserId}
                      data-testid="collaborator-option-all"
                      onClick={() => handleSelectCollaborator('all')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        !selectedUserId
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">Todos os colaboradores</span>
                      </div>
                      {!selectedUserId && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                      )}
                    </button>

                    {filteredUsersList.map(u => {
                      const isSelected = selectedUserId === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          data-testid={`collaborator-option-${u.id}`}
                          onClick={() =>
                            handleSelectCollaborator(u.id, u.nome_completo)
                          }
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-[10px] shrink-0">
                              {getUserInitials(u.nome_completo)}
                            </div>
                            <div className="min-w-0 truncate">
                              <p className="font-medium truncate leading-tight">
                                {u.nome_completo}
                              </p>
                              {u.email && (
                                <p className="text-[10px] text-muted-foreground truncate leading-tight">
                                  {u.email}
                                </p>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}

                    {filteredUsersList.length === 0 && (
                      <div
                        className="py-4 px-3 text-center text-xs text-muted-foreground"
                        data-testid="collaborator-no-results"
                      >
                        <UserX className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                        <span>Nenhum colaborador elegível encontrado</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Scope Info */}
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
            <div>
              {selectedUserName ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <span>Filtrado por: {selectedUserName}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectCollaborator('all')}
                    className="hover:text-rose-600 cursor-pointer"
                    aria-label="Remover filtro de colaborador"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : (
                <span>Exibindo todos os membros ativos</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {generalError && !isGeneralLoading && (
        <Alert variant="destructive">
          <AlertCircle className="w-5 h-5" />
          <AlertTitle>Erro ao obter relatório</AlertTitle>
          <AlertDescription className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>{generalError.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="text-xs shrink-0 bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Skeleton */}
      {isGeneralLoading && (
        <div className="space-y-6" data-testid="hour-report-loading">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      )}

      {/* Main Content */}
      {!isGeneralLoading && !generalError && metrics && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Active Period / Scope Meta Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">
                Período em Análise:
              </span>
              <Badge variant="secondary" className="font-normal font-mono">
                {formatDateLabel(metrics.inicio)} até{' '}
                {formatDateLabel(metrics.fim)}
              </Badge>
              <Badge variant="outline" className="font-normal">
                Setor: {sectorName}
              </Badge>
              {selectedUserName && (
                <Badge
                  variant="default"
                  className="font-normal bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
                >
                  <span>Colaborador: {selectedUserName}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectCollaborator('all')}
                    className="hover:text-rose-200 cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
            <span className="text-muted-foreground">
              Consolidação calculada pelo servidor
            </span>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Tempo Trabalhado Total */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tempo Trabalhado
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {formatDuration(metrics.tempo_trabalhado_segundos)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {horasTrabalhadasDec} horas líquidas computadas
                </p>
              </CardContent>
            </Card>

            {/* 2. Colaboradores Ativos */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Colaboradores Ativos
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {metrics.usuarios_com_tempo_trabalhado}
                </div>
                <p className="text-xs text-muted-foreground">
                  Membros com registro no período
                </p>
              </CardContent>
            </Card>

            {/* 3. Sessões Iniciadas */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Sessões de Ponto
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {metrics.sessoes_iniciadas}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de jornadas iniciadas
                </p>
              </CardContent>
            </Card>

            {/* 4. Tempo Pausado */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tempo em Pausas
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Coffee className="w-4 h-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {formatDuration(metrics.tempo_pausado_segundos)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {horasPausadasDec} horas em intervalos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Productivity & Executive Indicators Section */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <CardTitle className="text-base font-semibold">
                  Indicadores de Eficiência e Produtividade
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Médias calculadas com base no tempo trabalhado, pausas e número
                de colaboradores.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Indicador 1: Média por Colaborador */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">Média por Colaborador</span>
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="text-xl font-bold font-mono text-foreground">
                    {formatDuration(mediaPorColaboradorSegundos)}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Tempo médio líquido dedicado por colaborador ativo no
                    período.
                  </p>
                </div>

                {/* Indicador 2: Duração Média por Sessão */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">Média por Sessão</span>
                    <BarChart3 className="w-3.5 h-3.5 text-violet-500" />
                  </div>
                  <div className="text-xl font-bold font-mono text-foreground">
                    {formatDuration(mediaPorSessaoSegundos)}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Duração média de cada jornada de ponto registrada.
                  </p>
                </div>

                {/* Indicador 3: Taxa de Pausas */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">Taxa de Pausa</span>
                    <Percent className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-xl font-bold font-mono text-foreground">
                    {taxaPausaPercentual}%
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Percentual de tempo em intervalo sobre o tempo total de
                    expediente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evolução Temporal (GET /work-sessions/metrics/timeline) */}
          <Card
            className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"
            data-testid="timeline-metrics-card"
          >
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <CardTitle className="text-base font-semibold">
                      Evolução Temporal do Expediente
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Distribuição cronológica do tempo trabalhado e das pausas ao
                    longo do período.
                  </CardDescription>
                </div>

                {/* Grouping Toggle Buttons */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  <Button
                    type="button"
                    size="sm"
                    variant={timelineGrouping === 'dia' ? 'default' : 'ghost'}
                    onClick={() => setTimelineGrouping('dia')}
                    className="h-7 px-3 text-xs rounded-lg"
                  >
                    Diário
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      timelineGrouping === 'semana' ? 'default' : 'ghost'
                    }
                    onClick={() => setTimelineGrouping('semana')}
                    className="h-7 px-3 text-xs rounded-lg"
                  >
                    Semanal
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={timelineGrouping === 'mes' ? 'default' : 'ghost'}
                    onClick={() => setTimelineGrouping('mes')}
                    className="h-7 px-3 text-xs rounded-lg"
                  >
                    Mensal
                  </Button>
                </div>
              </div>

              {/* Legend row */}
              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block shrink-0" />
                  <span>Horas Trabalhadas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block shrink-0" />
                  <span>Pausas / Intervalos</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {isTimelineLoading && !timelineMetrics ? (
                <div className="h-56 flex items-end justify-between gap-3 py-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <Skeleton className="w-full h-36 rounded-xl" />
                      <Skeleton className="w-8 h-3 rounded" />
                    </div>
                  ))}
                </div>
              ) : !timelineMetrics ||
                timelineMetrics.intervalos.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground border rounded-xl border-dashed">
                  Nenhum registro cronológico encontrado para o período
                  selecionado.
                </div>
              ) : (
                <>
                  {/* Visual Bar Chart */}
                  <div className="overflow-x-auto pb-2">
                    <div className="min-w-[500px] flex items-end gap-3 sm:gap-4 h-64 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                      {timelineMetrics.intervalos.map((interval, idx) => {
                        const maxTimelineTime = Math.max(
                          ...timelineMetrics.intervalos.map(
                            i =>
                              i.tempo_trabalhado_segundos +
                              i.tempo_pausado_segundos,
                          ),
                          3600,
                        );

                        const workHeightPercent = Math.max(
                          interval.tempo_trabalhado_segundos > 0 ? 6 : 0,
                          Math.round(
                            (interval.tempo_trabalhado_segundos /
                              maxTimelineTime) *
                              100,
                          ),
                        );

                        const pauseHeightPercent = Math.max(
                          interval.tempo_pausado_segundos > 0 ? 4 : 0,
                          Math.round(
                            (interval.tempo_pausado_segundos /
                              maxTimelineTime) *
                              100,
                          ),
                        );

                        const label = formatTimelineIntervalLabel(
                          interval.inicio,
                          interval.fim,
                          timelineMetrics.agrupamento,
                        );

                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center justify-end h-full gap-2 group cursor-default"
                          >
                            {/* Worked Hours Header */}
                            <div className="text-[11px] font-mono font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                              {(
                                interval.tempo_trabalhado_segundos / 3600
                              ).toFixed(1)}
                              h
                            </div>

                            {/* Bar Column Container */}
                            <div className="w-full max-w-[44px] h-44 flex items-end justify-center gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 group-hover:border-indigo-200 dark:group-hover:border-indigo-900 transition-colors">
                              {/* Work Bar */}
                              <div
                                style={{ height: `${workHeightPercent}%` }}
                                className="w-1/2 rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-500 group-hover:from-indigo-500 group-hover:to-indigo-400 transition-all duration-300"
                                title={`Trabalhado: ${formatDuration(
                                  interval.tempo_trabalhado_segundos,
                                )}`}
                              />

                              {/* Pause Bar */}
                              <div
                                style={{ height: `${pauseHeightPercent}%` }}
                                className="w-1/2 rounded-t-md bg-gradient-to-t from-amber-500 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 transition-all duration-300"
                                title={`Pausas: ${formatDuration(
                                  interval.tempo_pausado_segundos,
                                )}`}
                              />
                            </div>

                            {/* Date Label */}
                            <div className="text-center">
                              <span className="block text-xs font-semibold text-foreground">
                                {label.primary}
                              </span>
                              {label.secondary && (
                                <span className="block text-[10px] text-muted-foreground uppercase font-medium">
                                  {label.secondary}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Intervalos Computados
                      </span>
                      <span className="font-semibold text-foreground font-mono">
                        {timelineMetrics.intervalos.length}{' '}
                        {timelineMetrics.agrupamento === 'dia'
                          ? 'dias'
                          : timelineMetrics.agrupamento === 'semana'
                            ? 'semanas'
                            : 'meses'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Média por Intervalo
                      </span>
                      <span className="font-semibold text-foreground font-mono">
                        {timelineMetrics.intervalos.length > 0
                          ? formatDuration(
                              Math.round(
                                timelineMetrics.intervalos.reduce(
                                  (acc, i) => acc + i.tempo_trabalhado_segundos,
                                  0,
                                ) / timelineMetrics.intervalos.length,
                              ),
                            )
                          : '0h 00m'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Fuso Horário
                      </span>
                      <Badge
                        variant="secondary"
                        className="font-mono text-[10px]"
                      >
                        {timelineMetrics.fuso}
                      </Badge>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Desempenho por Setor (GET /work-sessions/metrics/sectors) */}
          <Card
            className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"
            data-testid="sectors-metrics-card"
          >
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <CardTitle className="text-base font-semibold">
                    Desempenho por Setor
                  </CardTitle>
                </div>
                {sectorsMetrics && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {sectorsMetrics.total}{' '}
                    {sectorsMetrics.total === 1 ? 'setor' : 'setores'}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                Distribuição de horas líquidas, colaboradores ativos, pausas e
                impacto operacional por departamento.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {isSectorsLoading && !sectorsMetrics ? (
                <div className="space-y-3 py-4">
                  <Skeleton className="h-10 rounded-lg" />
                  <Skeleton className="h-10 rounded-lg" />
                  <Skeleton className="h-10 rounded-lg" />
                </div>
              ) : !sectorsMetrics || sectorsMetrics.setores.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhum setor com atividade registrada no período selecionado.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[28%]">Setor</TableHead>
                          <TableHead>Colaboradores</TableHead>
                          <TableHead>Jornadas</TableHead>
                          <TableHead>Tempo Trabalhado</TableHead>
                          <TableHead>Tempo em Pausa</TableHead>
                          <TableHead>Taxa de Pausa</TableHead>
                          <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sectorsMetrics.setores.map(sec => {
                          const totalSecTime =
                            sec.tempo_trabalhado_segundos +
                            sec.tempo_pausado_segundos;
                          const secPauseRate =
                            totalSecTime > 0
                              ? (
                                  (sec.tempo_pausado_segundos / totalSecTime) *
                                  100
                                ).toFixed(1)
                              : '0.0';
                          const totalOrgWorkSeconds =
                            metrics?.tempo_trabalhado_segundos || 0;
                          const percentualTotal =
                            totalOrgWorkSeconds > 0
                              ? (
                                  (sec.tempo_trabalhado_segundos /
                                    totalOrgWorkSeconds) *
                                  100
                                ).toFixed(1)
                              : '0.0';
                          const isCurrentFilter =
                            selectedSectorId === sec.setor_id;

                          return (
                            <TableRow key={sec.setor_id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 font-semibold text-xs flex items-center justify-center shrink-0">
                                    <Layers className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">
                                      {sec.setor_nome}
                                    </div>
                                    <div className="text-[11px] font-mono text-muted-foreground">
                                      {sec.setor_id.slice(0, 8)}...
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-normal"
                                >
                                  {sec.usuarios_com_tempo_trabalhado}{' '}
                                  {sec.usuarios_com_tempo_trabalhado === 1
                                    ? 'membro'
                                    : 'membros'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {sec.sessoes_iniciadas}{' '}
                                  {sec.sessoes_iniciadas === 1
                                    ? 'jornada'
                                    : 'jornadas'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-mono font-bold text-foreground">
                                    {formatDuration(
                                      sec.tempo_trabalhado_segundos,
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                      <div
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            Math.max(
                                              4,
                                              Number(percentualTotal),
                                            ),
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      {percentualTotal}% do total
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-mono text-muted-foreground">
                                  {formatDuration(sec.tempo_pausado_segundos)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs font-mono text-muted-foreground">
                                  {secPauseRate}%
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {isCurrentFilter ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSectorChange('all')}
                                    className="h-8 text-xs gap-1.5 rounded-lg border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/50 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-400 font-medium"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Remover filtro</span>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleSectorChange(sec.setor_id)
                                    }
                                    className="h-8 text-xs gap-1.5 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium"
                                  >
                                    <Filter className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Filtrar Setor</span>
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-muted-foreground">
                    <div>
                      Exibindo {sectorsMetrics.setores.length} de{' '}
                      {sectorsMetrics.total} setores
                      {totalSectorsPages > 1 &&
                        ` (Página ${sectorsPage} de ${totalSectorsPages})`}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSectorsPage(p => Math.max(1, p - 1))}
                        disabled={sectorsPage <= 1 || isSectorsLoading}
                        className="h-8 text-xs gap-1 rounded-lg"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSectorsPage(p =>
                            Math.min(totalSectorsPages, p + 1),
                          )
                        }
                        disabled={
                          sectorsPage >= totalSectorsPages || isSectorsLoading
                        }
                        className="h-8 text-xs gap-1 rounded-lg"
                      >
                        Próxima
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Desempenho por Colaborador (GET /work-sessions/metrics/users) */}
          <Card
            className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"
            data-testid="users-metrics-card"
          >
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <CardTitle className="text-base font-semibold">
                    Desempenho por Colaborador
                  </CardTitle>
                </div>
                {usersMetrics && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {usersMetrics.total}{' '}
                    {usersMetrics.total === 1 ? 'colaborador' : 'colaboradores'}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                Detalhamento individual de horas trabalhadas, tempo em pausas e
                sessões iniciadas com opção de detalhar jornadas.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {isUsersLoading && !usersMetrics ? (
                <div className="space-y-3 py-4">
                  <Skeleton className="h-10 rounded-lg" />
                  <Skeleton className="h-10 rounded-lg" />
                  <Skeleton className="h-10 rounded-lg" />
                </div>
              ) : !usersMetrics || usersMetrics.usuarios.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhum colaborador com atividade registrada no período
                  selecionado.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30%]">Colaborador</TableHead>
                          <TableHead>Jornadas</TableHead>
                          <TableHead>Tempo Trabalhado</TableHead>
                          <TableHead>Tempo em Pausa</TableHead>
                          <TableHead>Média / Jornada</TableHead>
                          <TableHead>Taxa de Pausa</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersMetrics.usuarios.map(u => {
                          const totalUserTime =
                            u.tempo_trabalhado_segundos +
                            u.tempo_pausado_segundos;
                          const userPauseRate =
                            totalUserTime > 0
                              ? (
                                  (u.tempo_pausado_segundos / totalUserTime) *
                                  100
                                ).toFixed(1)
                              : '0.0';
                          const mediaSessao =
                            u.sessoes_iniciadas > 0
                              ? Math.round(
                                  u.tempo_trabalhado_segundos /
                                    u.sessoes_iniciadas,
                                )
                              : 0;

                          return (
                            <TableRow key={u.usuario_id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center shrink-0">
                                    {getUserInitials(u.nome_completo)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">
                                      {u.nome_completo}
                                    </div>
                                    <div className="text-[11px] font-mono text-muted-foreground">
                                      {u.usuario_id.slice(0, 8)}...
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {u.sessoes_iniciadas}{' '}
                                  {u.sessoes_iniciadas === 1
                                    ? 'jornada'
                                    : 'jornadas'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="font-mono font-bold text-foreground">
                                  {formatDuration(u.tempo_trabalhado_segundos)}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  {(u.tempo_trabalhado_segundos / 3600).toFixed(
                                    1,
                                  )}
                                  h líquidas
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-mono text-muted-foreground">
                                  {formatDuration(u.tempo_pausado_segundos)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-mono text-xs text-foreground">
                                  {formatDuration(mediaSessao)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs font-mono text-muted-foreground">
                                  {userPauseRate}%
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setInspectedUser(u)}
                                  className="h-8 text-xs gap-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/50 border-indigo-200 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-400 font-medium"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Detalhar Sessões</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-muted-foreground">
                    <div>
                      Exibindo {usersMetrics.usuarios.length} de{' '}
                      {usersMetrics.total} colaboradores
                      {totalUsersPages > 1 &&
                        ` (Página ${usersPage} de ${totalUsersPages})`}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                        disabled={usersPage <= 1 || isUsersLoading}
                        className="h-8 text-xs gap-1 rounded-lg"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setUsersPage(p => Math.min(totalUsersPages, p + 1))
                        }
                        disabled={
                          usersPage >= totalUsersPages || isUsersLoading
                        }
                        className="h-8 text-xs gap-1 rounded-lg"
                      >
                        Próxima
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Drilldown sections: Resumo por Colaborador & Histórico Detalhado */}
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Auditoria e Registros Individuais
              </h2>
            </div>

            {/* Individual / Sector Summary Collapsible */}
            <SessionSummaryCollapsible
              key={`summary-${selectedUserId}`}
              initialSectorId={
                selectedSectorId !== 'all' ? selectedSectorId : undefined
              }
              initialUserId={selectedUserId.trim() || undefined}
            />

            {/* Complete Sessions History Collapsible */}
            <SessionHistoryCollapsible
              key={`history-${selectedUserId}`}
              initialOpen={false}
              initialSectorId={
                selectedSectorId !== 'all' ? selectedSectorId : undefined
              }
              initialUserId={selectedUserId.trim() || undefined}
            />
          </div>
        </div>
      )}

      {/* Modal de Detalhamento de Sessões do Colaborador Selecionado */}
      <Dialog
        open={Boolean(inspectedUser)}
        onOpenChange={open => !open && setInspectedUser(null)}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0">
                {getUserInitials(inspectedUser?.nome_completo || '')}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Sessões de {inspectedUser?.nome_completo}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Histórico de jornadas de ponto registradas no período
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {inspectedUser && (
            <div className="space-y-4 py-2">
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs text-muted-foreground font-medium">
                    Tempo Trabalhado
                  </div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {formatDuration(inspectedUser.tempo_trabalhado_segundos)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs text-muted-foreground font-medium">
                    Tempo em Pausa
                  </div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {formatDuration(inspectedUser.tempo_pausado_segundos)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs text-muted-foreground font-medium">
                    Total de Jornadas
                  </div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {inspectedUser.sessoes_iniciadas}
                  </div>
                </div>
              </div>

              {/* Sessions Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Jornadas Individuais ({inspectedUserSessions.length})
                  </span>
                </div>

                {isLoadingInspectedSessions ? (
                  <div className="flex items-center justify-center py-10 gap-2 text-sm text-muted-foreground">
                    <Spinner className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Carregando sessões do colaborador...</span>
                  </div>
                ) : inspectedSessionsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      {inspectedSessionsError}
                    </AlertDescription>
                  </Alert>
                ) : inspectedUserSessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground border rounded-xl border-dashed">
                    Nenhuma sessão individual encontrada para este colaborador
                    no período.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Horário (Entrada - Saída)</TableHead>
                          <TableHead>Setor</TableHead>
                          <TableHead>Tempo Trabalhado</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inspectedUserSessions.map(s => (
                          <TableRow key={s.id}>
                            <TableCell className="text-xs font-medium">
                              {formatSessionDate(s.entrada_em)}
                            </TableCell>
                            <TableCell className="text-xs font-mono">
                              {formatSessionTime(s.entrada_em)} -{' '}
                              {formatSessionTime(s.saida_em)}
                            </TableCell>
                            <TableCell className="text-xs">
                              {getSectorNameById(s.setor_id)}
                            </TableCell>
                            <TableCell className="text-xs font-mono font-semibold">
                              {formatDuration(s.tempo_trabalhado_segundos)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  s.status === 'ATIVA' ? 'default' : 'secondary'
                                }
                                className="text-[10px]"
                              >
                                {s.status === 'ATIVA' ? 'Ativa' : 'Finalizada'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setModalSessionId(s.id)}
                                className="h-7 text-xs gap-1 text-indigo-600 hover:text-indigo-700"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Ver Pausas</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {inspectedUser && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUserId(inspectedUser.usuario_id);
                  setInspectedUser(null);
                  setUsersPage(1);
                }}
                className="text-xs gap-1.5 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filtrar painel por este colaborador</span>
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={() => setInspectedUser(null)}
              className="text-xs rounded-xl"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Profundo de Detalhes da Sessão (Pausas, encerramento e cronologia) */}
      <SessionDetailModal
        isOpen={Boolean(modalSessionId)}
        sessionId={modalSessionId}
        onClose={() => setModalSessionId(null)}
      />
    </div>
  );
};

export default HourReport;
