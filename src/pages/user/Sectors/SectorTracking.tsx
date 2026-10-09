import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  ListTodo,
  RefreshCw,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { AuditTaskCard } from '@/features/weeklies/components/AuditTaskCard';
import { EvaluateWeeklyModal } from '@/features/weeklies/components/EvaluateWeeklyModal';
import { WeeklyPagination } from '@/features/weeklies/components/Pagination';
import { UpdateTaskPrazoModal } from '@/features/weeklies/components/UpdateTaskPrazoModal';
import { WarningsList } from '@/features/weeklies/components/WarningsList';
import { WeeklyDetailModal } from '@/features/weeklies/components/WeeklyDetailModal';
import { WeeklyStatusBadge } from '@/features/weeklies/components/WeeklyStatusBadge';
import {
  formatDateCivil,
  formatTimestampFortaleza,
  gerarSemanasReferencia,
} from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useAuth } from '@/hooks/useAuth';
import type {
  SectorDashboardResponse,
  TaskListResponse,
  TaskResponse,
  WeeklyListResponse,
  WeeklyStatus,
  WeeklySummaryResponse,
} from '@/types/weeklies';

type TabType = 'weeklies' | 'audit' | 'warnings';

export default function SectorTracking() {
  const { sectorId } = useParams<{ sectorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlertDialog } = useAlertDialog();

  const [activeTab, setActiveTab] = useState<TabType>('weeklies');

  // W07 Status filter & pagination
  const [weeklyStatusFilter, setWeeklyStatusFilter] = useState<
    WeeklyStatus | 'TODOS'
  >('TODOS');
  const [weekliesPage, setWeekliesPage] = useState(1);
  const weekliesLimit = 10;

  // T06 Audit pagination
  const [auditPage, setAuditPage] = useState(1);
  const auditLimit = 10;

  // Modals state
  const [selectedWeeklyId, setSelectedWeeklyId] = useState<string | null>(null);
  const [evaluatingWeekly, setEvaluatingWeekly] =
    useState<WeeklySummaryResponse | null>(null);
  const [prazoTask, setPrazoTask] = useState<TaskResponse | null>(null);

  // D01 Reference week selection
  const semanasOpcoes = useMemo(() => gerarSemanasReferencia(8), []);
  const [semanaReferencia, setSemanaReferencia] = useState<string>(
    semanasOpcoes[0]?.value || '',
  );

  // ── D01: Fetch Sector Dashboard ──────────────────────────────
  const fetchDashboard =
    useCallback(async (): Promise<SectorDashboardResponse> => {
      if (!sectorId) throw new Error('Setor não informado.');
      return dashboardApi.getSectorDashboard(sectorId, {
        semana_referencia: semanaReferencia || undefined,
      });
    }, [sectorId, semanaReferencia]);

  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useAsyncQuery(fetchDashboard);

  // ── W07: Fetch Sector Weeklies ───────────────────────────────
  const fetchSectorWeeklies =
    useCallback(async (): Promise<WeeklyListResponse> => {
      if (!sectorId) throw new Error('Setor não informado.');
      return weekliesApi.getSectorWeeklies(sectorId, {
        status: weeklyStatusFilter === 'TODOS' ? undefined : weeklyStatusFilter,
        pagina: weekliesPage,
        limite: weekliesLimit,
      });
    }, [sectorId, weeklyStatusFilter, weekliesPage, weekliesLimit]);

  const {
    data: weekliesData,
    isLoading: isWeekliesLoading,
    error: weekliesError,
    refetch: refetchWeeklies,
  } = useAsyncQuery(fetchSectorWeeklies, {
    enabled: Boolean(sectorId && !dashboardError),
  });

  // ── T06: Fetch Sector Audit Tasks ────────────────────────────
  const fetchAuditTasks = useCallback(async (): Promise<TaskListResponse> => {
    if (!sectorId) throw new Error('Setor não informado.');
    return tasksApi.getSectorAuditTasks(sectorId, {
      pagina: auditPage,
      limite: auditLimit,
    });
  }, [sectorId, auditPage, auditLimit]);

  const {
    data: auditData,
    isLoading: isAuditLoading,
    error: auditError,
    refetch: refetchAuditTasks,
  } = useAsyncQuery(fetchAuditTasks, {
    enabled: Boolean(sectorId && !dashboardError),
  });

  // T07: Direct conclude task
  const handleConcludeTask = async (taskId: string) => {
    try {
      await tasksApi.conclude(taskId);
      showAlertDialog({
        type: 'success',
        title: 'Tarefa concluída',
        message:
          'A tarefa foi marcada como concluída e saiu da fila de auditoria.',
      });
      await Promise.all([refetchAuditTasks(), refetchDashboard()]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Falha ao concluir tarefa';
      showAlertDialog({
        type: 'error',
        title: 'Erro ao concluir tarefa',
        message: msg,
      });
      throw err;
    }
  };

  // T05: Soft delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      showAlertDialog({
        type: 'success',
        title: 'Tarefa removida',
        message: 'A tarefa foi removida com sucesso pela liderança.',
      });
      await Promise.all([refetchAuditTasks(), refetchDashboard()]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Falha ao remover tarefa';
      showAlertDialog({
        type: 'error',
        title: 'Erro ao remover tarefa',
        message: msg,
      });
      throw err;
    }
  };

  // Refresh all current data
  const handleRefreshAll = () => {
    refetchDashboard();
    if (activeTab === 'weeklies') {
      refetchWeeklies();
    } else {
      refetchAuditTasks();
    }
  };

  // ── Access Denied / 403 Handler ─────────────────────────────
  if (dashboardError?.isForbidden || dashboardError?.status === 403) {
    return (
      <div
        className="w-full max-w-4xl mx-auto py-12 px-4 animate-in fade-in duration-300"
        data-testid="access-denied-state"
      >
        <Card className="border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm p-6 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-300">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-rose-900 dark:text-rose-200">
              Acesso restrito
            </h2>
            <p className="text-sm text-rose-700 dark:text-rose-300 max-w-md mx-auto">
              Esta área é reservada para líderes do setor e administradores do
              sistema.
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => navigate('/setores')}
              className="gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Setores</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── General Error Handler ───────────────────────────────────
  if (dashboardError) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="w-5 h-5" />
          <AlertTitle>Erro ao carregar acompanhamento do setor</AlertTitle>
          <AlertDescription className="mt-1">
            {dashboardError.message}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={() => refetchDashboard()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
          <Button variant="ghost" onClick={() => navigate('/setores')}>
            Voltar para Setores
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading Skeleton ────────────────────────────────────────
  if (isDashboardLoading || !dashboard) {
    return (
      <div
        className="w-full max-w-6xl mx-auto py-6 sm:py-10 space-y-6"
        data-testid="sector-tracking-loading"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-12 w-80 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const weekliesTotalPages = weekliesData
    ? Math.max(1, Math.ceil(weekliesData.total / weekliesLimit))
    : 1;

  const auditTotalPages = auditData
    ? Math.max(1, Math.ceil(auditData.total / auditLimit))
    : 1;

  return (
    <div
      className="w-full max-w-6xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in duration-300"
      data-testid="sector-tracking-page"
    >
      {/* Navigation and Sector Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/setores')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Catálogo de Setores</span>
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {dashboard.setor_nome}
              </h1>
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-xs font-semibold px-2.5 py-0.5"
              >
                Acompanhamento Setorial
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Semana de referência:{' '}
                <strong className="text-foreground">
                  {formatDateCivil(dashboard.semana_referencia)}
                </strong>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="semana-ref-select"
                className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Semana:
              </label>
              <select
                id="semana-ref-select"
                aria-label="Semana de referência"
                value={semanaReferencia}
                onChange={e => setSemanaReferencia(e.target.value)}
                className="h-9 px-3 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-foreground font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {semanasOpcoes.map(opcao => (
                  <option key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="gap-2 rounded-xl h-9"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* D01 Metrics Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Taxa de Submissão */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Taxa de Submissão
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-foreground">
                {dashboard.taxa_submissao_percentual}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {dashboard.weeklies_enviadas} enviadas de{' '}
              {dashboard.total_membros}{' '}
              {dashboard.total_membros === 1 ? 'membro' : 'membros'}
            </p>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, dashboard.taxa_submissao_percentual))}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Weeklies Status Breakdown */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Relatórios da Semana
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-muted-foreground">Aprovadas:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {dashboard.weeklies_aprovadas}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-muted-foreground">Rejeitadas:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {dashboard.weeklies_rejeitadas}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-muted-foreground">Expiradas:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {dashboard.weeklies_expiradas}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-muted-foreground">Rascunhos:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {dashboard.weeklies_rascunho}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Tasks Overview (Contagem atual do setor) */}
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tarefas do Setor (Status Atual)
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <ListTodo className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-foreground">
                {dashboard.total_tasks}
              </span>
              <span className="text-xs text-muted-foreground">
                {dashboard.tasks_concluidas} concluídas
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pendentes:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {dashboard.tasks_pendentes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Em Auditoria:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {dashboard.tasks_em_auditoria}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Impedimentos:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {dashboard.total_impedimentos}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation (Segmented Switcher) */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('weeklies')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'weeklies'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Avaliação de Weeklies (W07)</span>
            {weekliesData && (
              <Badge
                variant="secondary"
                className="ml-1 text-[11px] px-1.5 py-0 h-5"
              >
                {weekliesData.total}
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Fila de Auditoria (T06)</span>
            <Badge
              variant="secondary"
              className="ml-1 text-[11px] px-1.5 py-0 h-5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              {dashboard.tasks_em_auditoria}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('warnings')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'warnings'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Advertências do Setor (A02)</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: Avaliação de Weeklies (W07) ──────────────────────── */}
      {activeTab === 'weeklies' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {(
                [
                  'TODOS',
                  'ENVIADA',
                  'APROVADA',
                  'REJEITADA',
                  'EXPIRADA',
                  'RASCUNHO',
                ] as const
              ).map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setWeeklyStatusFilter(status);
                    setWeekliesPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    weeklyStatusFilter === status
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {status === 'TODOS'
                    ? 'Todos'
                    : status === 'ENVIADA'
                      ? 'Enviadas'
                      : status === 'APROVADA'
                        ? 'Aprovadas'
                        : status === 'REJEITADA'
                          ? 'Rejeitadas'
                          : status === 'EXPIRADA'
                            ? 'Expiradas'
                            : 'Rascunhos'}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchWeeklies()}
              disabled={isWeekliesLoading}
              className="text-xs h-8 gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isWeekliesLoading ? 'animate-spin' : ''}`}
              />
              <span>Recarregar</span>
            </Button>
          </div>

          {/* Weeklies List State */}
          {isWeekliesLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm">Carregando fila de weeklies...</p>
            </div>
          )}

          {weekliesError && !isWeekliesLoading && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Erro ao carregar fila de weeklies</AlertTitle>
              <AlertDescription>{weekliesError.message}</AlertDescription>
            </Alert>
          )}

          {!isWeekliesLoading && !weekliesError && weekliesData && (
            <>
              {weekliesData.weeklies.length === 0 ? (
                <div className="py-16 text-center space-y-3 border border-dashed rounded-2xl p-8 border-slate-200 dark:border-slate-800">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <h3 className="font-semibold text-foreground">
                    Nenhuma weekly encontrada
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Não há relatórios com o filtro selecionado para este setor.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weekliesData.weeklies.map(weekly => {
                    const isSelfWeekly = Boolean(
                      user?.id && weekly.usuario_id === user.id,
                    );
                    const canEvaluate = weekly.status === 'ENVIADA';

                    return (
                      <Card
                        key={weekly.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-foreground">
                                {weekly.membro_nome ||
                                  `Membro ID: ${weekly.usuario_id}`}
                              </span>
                              <WeeklyStatusBadge status={weekly.status} />
                              {isSelfWeekly && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                  Sua Weekly
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span>
                                Semana de{' '}
                                {formatDateCivil(weekly.semana_referencia)}
                              </span>
                              {weekly.enviada_em && (
                                <span>
                                  • Enviada em:{' '}
                                  {formatTimestampFortaleza(weekly.enviada_em)}
                                </span>
                              )}
                              <span>
                                • {weekly.total_tasks}{' '}
                                {weekly.total_tasks === 1
                                  ? 'tarefa'
                                  : 'tarefas'}
                                {weekly.total_concluidas > 0 &&
                                  ` (${weekly.total_concluidas} conc.)`}
                              </span>
                              {weekly.total_impedimentos > 0 && (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  • {weekly.total_impedimentos} impedimento(s)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedWeeklyId(weekly.id)}
                              className="text-xs h-8 gap-1.5 rounded-xl"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Detalhes</span>
                            </Button>

                            {canEvaluate && (
                              <Button
                                size="sm"
                                onClick={() => setEvaluatingWeekly(weekly)}
                                disabled={isSelfWeekly}
                                title={
                                  isSelfWeekly
                                    ? 'Autoavaliação não permitida: você não pode avaliar seu próprio relatório semanal'
                                    : undefined
                                }
                                className={`text-xs h-8 gap-1.5 rounded-xl ${
                                  isSelfWeekly
                                    ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Avaliar</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              <WeeklyPagination
                currentPage={weekliesPage}
                totalPages={weekliesTotalPages}
                onPageChange={setWeekliesPage}
              />
            </>
          )}
        </div>
      )}

      {/* ── TAB 2: Fila de Auditoria de Tarefas (T06) ────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
            <div>
              <h3 className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
                Fila de Auditoria do Setor
              </h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                Tarefas sob validação ou auditoria da liderança. O gestor pode
                prorrogar prazos, concluir tarefas diretamente ou removê-las.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchAuditTasks()}
              disabled={isAuditLoading}
              className="text-xs h-8 gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isAuditLoading ? 'animate-spin' : ''}`}
              />
              <span>Recarregar Fila</span>
            </Button>
          </div>

          {isAuditLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm">Carregando fila de auditoria...</p>
            </div>
          )}

          {auditError && !isAuditLoading && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Erro ao carregar fila de auditoria</AlertTitle>
              <AlertDescription>{auditError.message}</AlertDescription>
            </Alert>
          )}

          {!isAuditLoading && !auditError && auditData && (
            <>
              {auditData.tasks.length === 0 ? (
                <div className="py-16 text-center space-y-3 border border-dashed rounded-2xl p-8 border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h3 className="font-semibold text-foreground">
                    Fila de auditoria limpa
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Nenhuma tarefa pendente de auditoria para este setor no
                    momento.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditData.tasks.map(task => (
                    <AuditTaskCard
                      key={task.id}
                      task={task}
                      currentUserId={user?.id}
                      onUpdatePrazo={t => setPrazoTask(t)}
                      onConclude={handleConcludeTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}

              <WeeklyPagination
                currentPage={auditPage}
                totalPages={auditTotalPages}
                onPageChange={setAuditPage}
              />
            </>
          )}
        </div>
      )}

      {/* ── TAB 3: Advertências do Setor (A02) ──────────────────────── */}
      {activeTab === 'warnings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <WarningsList mode="sector" sectorId={sectorId} />
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}

      {/* Modal W04: Visualização completa da Weekly */}
      {selectedWeeklyId && (
        <WeeklyDetailModal
          isOpen={Boolean(selectedWeeklyId)}
          weeklyId={selectedWeeklyId}
          isLeaderOrAdmin={true}
          currentUserId={user?.id}
          onClose={() => setSelectedWeeklyId(null)}
          onWeeklyUpdated={() => {
            refetchWeeklies();
            refetchDashboard();
          }}
        />
      )}

      {/* Modal W08: Avaliar Weekly */}
      {evaluatingWeekly && (
        <EvaluateWeeklyModal
          isOpen={Boolean(evaluatingWeekly)}
          weeklyId={evaluatingWeekly.id}
          semanaReferencia={evaluatingWeekly.semana_referencia}
          membroNome={evaluatingWeekly.membro_nome}
          membroId={evaluatingWeekly.usuario_id}
          currentUserId={user?.id}
          onClose={() => setEvaluatingWeekly(null)}
          onSuccess={() => {
            setEvaluatingWeekly(null);
            refetchWeeklies();
            refetchDashboard();
          }}
        />
      )}

      {/* Modal T04: Prorrogar Prazo de Tarefa */}
      {prazoTask && (
        <UpdateTaskPrazoModal
          isOpen={Boolean(prazoTask)}
          taskId={prazoTask.id}
          taskTitulo={prazoTask.titulo}
          prazoAtual={prazoTask.prazo_conclusao}
          onClose={() => setPrazoTask(null)}
          onSuccess={() => {
            setPrazoTask(null);
            refetchAuditTasks();
          }}
        />
      )}
    </div>
  );
}
