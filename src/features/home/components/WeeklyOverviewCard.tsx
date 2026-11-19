import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  FileText,
  FolderKanban,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { WeeklyReviewSummarySheet } from '@/features/weeklies/components/WeeklyReviewSummarySheet';
import { WeeklyStatusBadge } from '@/features/weeklies/components/WeeklyStatusBadge';
import { WeeklyStatusCta } from '@/features/weeklies/components/WeeklyStatusCta';
import { useCurrentWeekly } from '@/features/weeklies/hooks/useCurrentWeekly';
import { formatDateCivil } from '@/features/weeklies/utils/dateUtils';

export function WeeklyOverviewCard() {
  const navigate = useNavigate();
  const {
    mySectors,
    selectedSector,
    selectedSectorId,
    setSelectedSectorId,
    isLoading: isLoadingSectors,
  } = useSectorContext();

  // Garante que haja um setor válido selecionado ao abrir o dashboard
  useEffect(() => {
    if (isLoadingSectors) return;
    if (mySectors.length > 0) {
      if (
        !selectedSectorId ||
        !mySectors.some(s => s.id === selectedSectorId)
      ) {
        setSelectedSectorId(mySectors[0].id);
      }
    }
  }, [isLoadingSectors, mySectors, selectedSectorId, setSelectedSectorId]);

  const {
    currentWeekly,
    isLoadingWeekly,
    weeklyNotFoundError,
    createWeeklyMutation,
    retrospectiveTasks,
    uncompletedRetrospectiveTasks,
    plannedTasks,
    pendingHerdadaCount,
    isEditable,
    isReviewSheetOpen,
    setIsReviewSheetOpen,
  } = useCurrentWeekly({
    selectedSectorId,
    enabled: Boolean(selectedSectorId),
  });

  const handleCreateAndOpen = async () => {
    const result = await createWeeklyMutation.execute();
    if (result) {
      navigate('/weeklies');
    }
  };

  const impedimentsCount = (currentWeekly?.tasks ?? []).filter(t =>
    Boolean(t?.impedimento),
  ).length;
  const deliveredCount = retrospectiveTasks.filter(t => t.concluida).length;
  const plannedCount =
    plannedTasks.length + uncompletedRetrospectiveTasks.length;

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Weekly da Semana
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resumo do seu relatório semanal atual
            </p>
          </div>
        </div>

        {mySectors.length > 1 && (
          <div className="w-full sm:w-56">
            <Select
              value={selectedSectorId || ''}
              onValueChange={val => setSelectedSectorId(val || null)}
            >
              <SelectTrigger
                aria-label="Setor da weekly"
                className="h-9 text-xs"
              >
                <SelectValue placeholder="Selecione um setor..." />
              </SelectTrigger>
              <SelectContent>
                {mySectors.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        {isLoadingSectors || (selectedSectorId && isLoadingWeekly) ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        ) : mySectors.length === 0 ? (
          <div className="py-4 text-center space-y-3">
            <FolderKanban className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Você ainda não está vinculado a um setor
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Para iniciar suas weeklies e registrar horas, entre em um setor
                pelo catálogo.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => navigate('/setores')}
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <FolderKanban className="w-4 h-4" />
              Explorar Setores
            </Button>
          </div>
        ) : weeklyNotFoundError || !currentWeekly ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/40 dark:border-indigo-950/60 dark:bg-indigo-950/15 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selectedSector?.nome || 'Setor selecionado'}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[11px] bg-white dark:bg-slate-900"
                  >
                    Não iniciada
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Você ainda não criou a weekly desta semana. Ao iniciar, suas
                  tarefas pendentes anteriores são herdadas automaticamente.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <WeeklyStatusCta
                weekly={null}
                notFound={true}
                isCreating={createWeeklyMutation.isMutating}
                onCreate={handleCreateAndOpen}
                onNavigateToEditor={() => navigate('/weeklies')}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Semana de {formatDateCivil(currentWeekly.semana_referencia)}
                  </h3>
                  <WeeklyStatusBadge status={currentWeekly.status} />
                </div>
                <p className="text-xs text-slate-500">
                  Setor: {selectedSector?.nome || 'Setor'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/15 p-3.5 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Entregas anteriores
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {deliveredCount}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/15 p-3.5 flex items-center gap-3">
                <ListChecks className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Planejadas nesta semana
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {plannedCount}
                  </p>
                </div>
              </div>

              <div
                className={`rounded-xl border p-3.5 flex items-center gap-3 ${
                  isEditable && pendingHerdadaCount > 0
                    ? 'border-amber-300 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 ${
                    isEditable && pendingHerdadaCount > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                <div>
                  {isEditable && pendingHerdadaCount > 0 ? (
                    <>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        Revisão pendente
                      </p>
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                        {pendingHerdadaCount} herdada(s)
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Impedimentos
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {impedimentsCount}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {mySectors.length > 0 && (
        <CardFooter className="border-t border-slate-100 dark:border-slate-800 px-5 sm:px-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/weeklies/historico"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center gap-1"
          >
            Ver todas as weeklies
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {currentWeekly && (
            <div className="flex flex-wrap items-center gap-2">
              {currentWeekly.status === 'RASCUNHO' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReviewSheetOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Visualizar resumo
                </Button>
              )}

              <WeeklyStatusCta
                weekly={currentWeekly}
                notFound={weeklyNotFoundError}
                isLoading={isLoadingWeekly}
                isCreating={createWeeklyMutation.isMutating}
                onCreate={handleCreateAndOpen}
                onNavigateToEditor={() => navigate('/weeklies')}
                onViewSummary={() => setIsReviewSheetOpen(true)}
              />
            </div>
          )}
        </CardFooter>
      )}

      {currentWeekly && (
        <WeeklyReviewSummarySheet
          isOpen={isReviewSheetOpen}
          onClose={() => setIsReviewSheetOpen(false)}
          semanaReferencia={currentWeekly.semana_referencia}
          retrospectiveTasks={retrospectiveTasks}
          uncompletedRetrospectiveTasks={uncompletedRetrospectiveTasks}
          plannedTasks={plannedTasks}
          isRejeitada={currentWeekly.status === 'REJEITADA'}
          readOnly={true}
        />
      )}
    </Card>
  );
}
