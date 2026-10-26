import { AlertCircle, FileText, Filter, RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';

import Header from '@/components/layout/Header/Header';
import EmptyState from '@/components/shared/EmptyState/EmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { WeeklyPagination } from '@/features/weeklies/components/Pagination';
import { WeeklyDetailModal } from '@/features/weeklies/components/WeeklyDetailModal';
import { WeeklySummaryCard } from '@/features/weeklies/components/WeeklySummaryCard';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import type { SectorListItem } from '@/types/sectors';
import type { WeeklyStatus, WeeklySummaryResponse } from '@/types/weeklies';

const ITEMS_PER_PAGE = 10;

const WeeklyHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [selectedWeeklyId, setSelectedWeeklyId] = useState<string | null>(null);

  // List user's sectors for the filter
  const fetchSectors = useCallback(async () => {
    return sectorsApi.list({ limite: 100 });
  }, []);
  const { data: sectorsData } = useAsyncQuery(fetchSectors);
  const sectors: SectorListItem[] = sectorsData?.setores || [];

  // W01: Get user's weeklies with server pagination and filters
  const sectorParam =
    selectedSectorId === 'todos' ? undefined : selectedSectorId;
  const statusParam =
    selectedStatus === 'TODOS' ? undefined : (selectedStatus as WeeklyStatus);

  const fetchWeeklies = useCallback(async () => {
    return weekliesApi.getMyWeeklies({
      pagina: currentPage,
      limite: ITEMS_PER_PAGE,
      setor_id: sectorParam,
      status: statusParam,
    });
  }, [currentPage, sectorParam, statusParam]);

  const {
    data: listData,
    isLoading,
    error,
    refetch,
  } = useAsyncQuery(fetchWeeklies);

  // Reset to page 1 whenever filters change
  const handleSectorChange = (value: string) => {
    setSelectedSectorId(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleClearSectorFilter = () => {
    setSelectedSectorId('todos');
    setCurrentPage(1);
  };

  const totalPages = listData ? Math.ceil(listData.total / listData.limite) : 1;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Find sector name helper
  const getSectorName = (sectorId: string) => {
    const found = sectors.find(s => s.id === sectorId);
    return found ? found.nome : undefined;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        title="Minhas weeklies"
        subtitle="Histórico completo de relatórios semanais enviados e avaliados"
      />

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 mt-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Filtros:</span>
          </div>

          {/* Sector Filter */}
          <div className="w-full sm:w-48">
            <Select value={selectedSectorId} onValueChange={handleSectorChange}>
              <SelectTrigger className="rounded-xl h-9 text-xs">
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                {sectors.map(sector => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="rounded-xl h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os status</SelectItem>
                <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                <SelectItem value="ENVIADA">Enviada</SelectItem>
                <SelectItem value="APROVADA">Aprovada</SelectItem>
                <SelectItem value="REJEITADA">Rejeitada</SelectItem>
                <SelectItem value="EXPIRADA">Expirada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {listData && (
            <span className="text-xs text-muted-foreground">
              Total: <strong>{listData.total}</strong>{' '}
              {listData.total === 1 ? 'weekly' : 'weeklies'}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-8 px-2.5 rounded-lg text-muted-foreground hover:text-foreground"
            title="Atualizar lista"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Error State with Graceful Sector Filter Recovery */}
      {error && (
        <div className="mt-6">
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <AlertTitle>Erro ao carregar histórico de weeklies</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>
                {error.message ||
                  'Ocorreu uma falha ao consultar suas weeklies no servidor.'}
              </p>
              {selectedSectorId !== 'todos' && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-slate-900 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50"
                    onClick={handleClearSectorFilter}
                  >
                    Ver todas as weeklies (limpar filtro de setor)
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4 mt-6" data-testid="weeklies-loading">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
      )}

      {/* Main List */}
      {!isLoading && !error && listData && (
        <>
          {listData.weeklies.length > 0 ? (
            <div className="space-y-4 mt-6">
              {listData.weeklies.map((weekly: WeeklySummaryResponse) => (
                <WeeklySummaryCard
                  key={weekly.id}
                  weekly={weekly}
                  sectorName={getSectorName(weekly.setor_id)}
                  onViewDetails={id => setSelectedWeeklyId(id)}
                />
              ))}

              <WeeklyPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                icon={FileText}
                title="Nenhuma weekly encontrada"
                description={
                  selectedSectorId !== 'todos' || selectedStatus !== 'TODOS'
                    ? 'Nenhum relatório corresponde aos filtros selecionados. Tente ajustar os filtros.'
                    : 'Você ainda não possui relatórios semanais registrados.'
                }
              />
            </div>
          )}
        </>
      )}

      {/* Reusable Detail Modal */}
      <WeeklyDetailModal
        isOpen={Boolean(selectedWeeklyId)}
        weeklyId={selectedWeeklyId}
        onClose={() => setSelectedWeeklyId(null)}
        onWeeklyUpdated={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default WeeklyHistory;
