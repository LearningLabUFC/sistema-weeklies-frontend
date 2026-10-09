import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FolderKanban,
  ListTodo,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '@/components/layout/Header/Header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import {
  formatDateCivil,
  gerarSemanasReferencia,
} from '@/features/weeklies/utils/dateUtils';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import type { GlobalDashboardResponse } from '@/types/weeklies';

export function Dashboard() {
  const semanasOpcoes = useMemo(() => gerarSemanasReferencia(8), []);
  const [semanaReferencia, setSemanaReferencia] = useState<string>(
    semanasOpcoes[0]?.value || '',
  );

  const fetchGlobalDashboard =
    useCallback(async (): Promise<GlobalDashboardResponse> => {
      return dashboardApi.getGlobalDashboard({
        semana_referencia: semanaReferencia || undefined,
      });
    }, [semanaReferencia]);

  const { data, isLoading, error, refetch } =
    useAsyncQuery(fetchGlobalDashboard);

  return (
    <div
      className="w-full py-6 sm:py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      data-testid="admin-dashboard"
    >
      {/* Page Header with Reference Week Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Dashboard Geral"
          subtitle="Visão consolidada de weeklies, setores e auditoria da organização"
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="dashboard-semana-select"
              className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Semana:
            </label>
            <select
              id="dashboard-semana-select"
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
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2 rounded-xl h-9"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span>Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="w-5 h-5" />
          <AlertTitle>Erro ao carregar dashboard global</AlertTitle>
          <AlertDescription className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>{error.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs shrink-0 bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6" data-testid="dashboard-loading">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && data && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Key Metrics Grid (D02) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: Setores */}
            <Link
              to="/admin/setores"
              className="group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl"
            >
              <Card className="h-full rounded-2xl transition-all duration-300 hover:shadow-md hover:border-indigo-500/50 dark:hover:border-indigo-400/50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl border bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {data.total_setores}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                      Setores Cadastrados
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Card 2: Total Membros em Setores */}
            <Card className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl border bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {data.total_membros}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Vínculos em Setores
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                    *Soma de vínculos dos setores
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Taxa de Submissão Geral */}
            <Card className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {data.taxa_submissao_geral_percentual}%
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Taxa Geral de Submissão
                  </p>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {data.total_weeklies_enviadas} enviadas na semana
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Tarefas em Auditoria (Fila atual dos setores) */}
            <Card className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl border bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {data.total_tasks_em_auditoria}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Tarefas em Auditoria
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                    *Fila atual dos setores
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Card 5: Total de Impedimentos */}
            <Card className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl border bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {data.total_impedimentos}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Impedimentos Ativos
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                    *Bloqueios sinalizados
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weeklies Consolidation Card */}
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="text-base font-bold text-foreground">
                  Balanço de Relatórios Semanais
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Semana de referência:{' '}
                <strong className="text-foreground">
                  {formatDateCivil(data.semana_referencia)}
                </strong>
              </p>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 block">
                    Aprovadas
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {data.total_weeklies_aprovadas}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                  <span className="text-xs font-medium text-rose-800 dark:text-rose-300 block">
                    Rejeitadas
                  </span>
                  <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
                    {data.total_weeklies_rejeitadas}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-300 block">
                    Expiradas
                  </span>
                  <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                    {data.total_weeklies_expiradas}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Rascunhos
                  </span>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
                    {data.total_weeklies_rascunho}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sectors Breakdown Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Desempenho por Setor
                </h3>
                <p className="text-xs text-muted-foreground">
                  Métricas individuais e acesso rápido ao acompanhamento de cada
                  setor
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 rounded-xl text-xs h-8"
              >
                <Link to="/admin/setores">
                  <span>Ver todos os setores</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            {data.setores.length === 0 ? (
              <Card className="p-12 text-center border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
                <FolderKanban className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <h4 className="font-semibold text-foreground">
                  Nenhum setor cadastrado
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Ainda não existem setores configurados no sistema. Cadastre
                  setores para acompanhar suas métricas.
                </p>
                <Button asChild size="sm" className="mt-4 rounded-xl">
                  <Link to="/admin/setores">Cadastrar Novo Setor</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.setores.map(setor => (
                  <Card
                    key={setor.setor_id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Sector Card Header */}
                      <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-row items-center justify-between gap-2 space-y-0">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base font-bold text-foreground truncate">
                            {setor.setor_nome}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {setor.total_membros}{' '}
                            {setor.total_membros === 1 ? 'membro' : 'membros'}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs font-semibold px-2 py-0.5 shrink-0"
                        >
                          {setor.taxa_submissao_percentual}% submissão
                        </Badge>
                      </CardHeader>

                      <CardContent className="p-5 space-y-4">
                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Submissões da semana</span>
                            <span className="font-medium text-foreground">
                              {setor.weeklies_enviadas} de {setor.total_membros}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(0, setor.taxa_submissao_percentual))}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Weeklies Mini Grid */}
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30">
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">
                              Aprov.
                            </span>
                            <span className="font-bold text-emerald-800 dark:text-emerald-300">
                              {setor.weeklies_aprovadas}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30">
                            <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-medium">
                              Rejeit.
                            </span>
                            <span className="font-bold text-rose-800 dark:text-rose-300">
                              {setor.weeklies_rejeitadas}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30">
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-medium">
                              Expir.
                            </span>
                            <span className="font-bold text-amber-800 dark:text-amber-300">
                              {setor.weeklies_expiradas}
                            </span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-medium">
                              Rasc.
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {setor.weeklies_rascunho}
                            </span>
                          </div>
                        </div>

                        {/* Tasks Status Atual do Setor */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Tarefas Concluídas:
                            </span>
                            <strong className="text-foreground">
                              {setor.tasks_concluidas}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                              Tarefas Pendentes:
                            </span>
                            <strong className="text-foreground">
                              {setor.tasks_pendentes}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              Em Auditoria:
                            </span>
                            <strong className="text-indigo-600 dark:text-indigo-400">
                              {setor.tasks_em_auditoria}
                            </strong>
                          </div>
                          {setor.total_impedimentos > 0 && (
                            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-medium">
                              <span className="flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Impedimentos:
                              </span>
                              <strong>{setor.total_impedimentos}</strong>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>

                    {/* Sector Card Footer Actions */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex-1 rounded-xl text-xs h-8 gap-1.5"
                      >
                        <Link to={`/admin/setores/${setor.setor_id}`}>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalhes</span>
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        asChild
                        className="flex-1 rounded-xl text-xs h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                      >
                        <Link to={`/setores/${setor.setor_id}/acompanhamento`}>
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Acompanhar</span>
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
