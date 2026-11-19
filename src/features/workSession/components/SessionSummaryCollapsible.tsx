import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FileText,
  Layers,
  RotateCcw,
  Target,
  Timer,
  TrendingUp,
  User as UserIcon,
} from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { SectorContext } from '@/features/sectors/context/sectorContextDef';
import { useAuth } from '@/hooks/useAuth';
import { workSessionService } from '@/services/workSessionService';
import type {
  GetWorkSessionSummaryParams,
  WorkSessionSummaryResponse,
} from '@/types/workSession';

/**
 * Formata segundos no formato Xh Ym
 */
function formatDurationSummary(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);

  if (hours === 0 && minutes === 0) {
    return '0h 00m';
  }
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

/**
 * Retorna os limites (ISO 8601 UTC) do início e fim da semana corrente (de domingo ou segunda até domingo)
 */
function getWeekRange(): { inicio: string; fim: string; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda...

  // Ajuste para início na segunda-feira
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const formatShortDate = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  return {
    inicio: monday.toISOString(),
    fim: sunday.toISOString(),
    label: `Semana Atual (${formatShortDate(monday)} a ${formatShortDate(sunday)})`,
  };
}

/**
 * Retorna os limites (ISO 8601 UTC) do mês corrente
 */
function getMonthRange(): { inicio: string; fim: string; label: string } {
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

  const monthName = now.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return {
    inicio: firstDay.toISOString(),
    fim: lastDay.toISOString(),
    label: `Mês Atual (${monthName})`,
  };
}

interface SessionSummaryCollapsibleProps {
  refreshTrigger?: number;
  initialSectorId?: string;
  initialUserId?: string;
}

export const SessionSummaryCollapsible = ({
  refreshTrigger = 0,
  initialSectorId,
  initialUserId,
}: SessionSummaryCollapsibleProps) => {
  const { user } = useAuth();

  const sectorContext = useContext(SectorContext);
  const sectors = useMemo(
    () => sectorContext?.sectors ?? [],
    [sectorContext?.sectors],
  );
  const mySectors = useMemo(
    () => sectorContext?.mySectors ?? [],
    [sectorContext?.mySectors],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [periodType, setPeriodType] = useState<'week' | 'month'>('week');
  const [selectedSectorId, setSelectedSectorId] = useState<string>(
    initialSectorId || 'all',
  );
  const [selectedUserId, setSelectedUserId] = useState<string>(
    initialUserId || '',
  );

  const [summary, setSummary] = useState<WorkSessionSummaryResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin =
    user?.global_role === 'admin' || user?.global_role === 'super_admin';

  const isLeader = mySectors.some(s => s.papel === 'lider');

  const isAdminOrLeader = isAdmin || isLeader;

  // Setores disponíveis:
  // Administradores: todos os setores da organização.
  // Membros comuns e líderes: estritamente os setores aos quais possui vínculo (mySectors).
  // Se não possuir vínculo com nenhum setor, a lista fica vazia (não vaza os demais setores da empresa).
  const availableSectors = useMemo(() => {
    if (isAdmin) {
      return sectors.length > 0 ? sectors : mySectors;
    }
    return mySectors;
  }, [isAdmin, sectors, mySectors]);

  const currentRange = periodType === 'week' ? getWeekRange() : getMonthRange();

  const getSectorName = (setorId?: string | null): string => {
    if (!setorId || setorId === 'all') return 'Todos os setores';
    const found =
      mySectors.find(s => s.id === setorId) ||
      sectors.find(s => s.id === setorId);
    return found?.nome || 'Setor vinculado';
  };

  const fetchSummary = useCallback(
    async (
      overridePeriod?: 'week' | 'month',
      overrideSector?: string,
      overrideUser?: string,
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const currentPeriod = overridePeriod ?? periodType;
        const currentSector = overrideSector ?? selectedSectorId;
        const currentUser = overrideUser ?? selectedUserId;

        const range =
          currentPeriod === 'week' ? getWeekRange() : getMonthRange();

        const params: GetWorkSessionSummaryParams = {
          inicio: range.inicio,
          fim: range.fim,
        };

        if (currentSector && currentSector !== 'all') {
          params.setor_id = currentSector;
        }

        if (currentUser && currentUser.trim() !== '') {
          params.usuario_id = currentUser.trim();
        }

        const data = await workSessionService.getSummary(params);
        setSummary(data);
        setHasLoaded(true);
      } catch (err: unknown) {
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || 'Não foi possível carregar o resumo de horas.';
        setError(detail);
      } finally {
        setIsLoading(false);
      }
    },
    [periodType, selectedSectorId, selectedUserId],
  );

  // Carrega ao mudar o tipo de período ou filtros ou quando refreshTrigger for acionado
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const range = periodType === 'week' ? getWeekRange() : getMonthRange();

        const params: GetWorkSessionSummaryParams = {
          inicio: range.inicio,
          fim: range.fim,
        };

        if (selectedSectorId && selectedSectorId !== 'all') {
          params.setor_id = selectedSectorId;
        }

        if (selectedUserId && selectedUserId.trim() !== '') {
          params.usuario_id = selectedUserId.trim();
        }

        const data = await workSessionService.getSummary(params);
        if (!isMounted) return;
        setSummary(data);
        setHasLoaded(true);
      } catch (err: unknown) {
        if (!isMounted) return;
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || 'Não foi possível carregar o resumo de horas.';
        setError(detail);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, periodType, selectedSectorId, selectedUserId, refreshTrigger]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
  };

  const handlePeriodChange = (type: 'week' | 'month') => {
    setPeriodType(type);
  };

  const handleSectorChange = (value: string) => {
    setSelectedSectorId(value);
  };

  const handleApplyUserFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSummary();
  };

  const handleClearFilters = () => {
    setSelectedSectorId('all');
    setSelectedUserId(initialUserId || '');
    setError(null);
  };

  const hasActiveFilters =
    selectedSectorId !== 'all' ||
    Boolean(selectedUserId && selectedUserId !== initialUserId);

  // Cálculo de progresso da meta semanal do usuário (se aplicável ao próprio usuário)
  const isViewingSelf =
    !selectedUserId ||
    selectedUserId.trim() === '' ||
    selectedUserId === user?.id;
  const metaHoras = user?.meta_horas_semanais || 0;
  const metaSegundos = metaHoras * 3600;
  const totalSegundos = summary?.tempo_trabalhado_segundos || 0;
  const porcentagemMeta =
    metaSegundos > 0
      ? Math.min(100, Math.round((totalSegundos / metaSegundos) * 100))
      : 0;

  return (
    <div className="w-full mt-4">
      <Card className="border-border/60 shadow-xs overflow-hidden transition-all duration-300">
        {/* Barra de Controle (Gatilho) */}
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center justify-between p-4 sm:px-6 hover:bg-muted/40 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2.5">
            <ChevronDown
              className={`size-4.5 text-muted-foreground transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
            <span className="font-semibold text-base text-foreground tracking-tight">
              Resumo de Horas
            </span>
            {hasLoaded && summary && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20"
              >
                {formatDurationSummary(summary.tempo_trabalhado_segundos)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="size-5" />
          </div>
        </button>

        {/* Conteúdo Expandível */}
        {isOpen && (
          <CardContent className="p-4 sm:p-6 pt-3 border-t border-border/40 animate-in fade-in-50 duration-300">
            {/* Seletor de Período e Filtros */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-4 mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {currentRange.label}
                </span>

                <div className="inline-flex rounded-lg bg-muted p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handlePeriodChange('week')}
                    className={`px-3 py-1 font-medium rounded-md transition-all ${
                      periodType === 'week'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Esta Semana
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodChange('month')}
                    className={`px-3 py-1 font-medium rounded-md transition-all ${
                      periodType === 'month'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Este Mês
                  </button>
                </div>
              </div>

              {/* Filtro por Setor e Usuário */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-border/30 items-end">
                {/* Filtro de Setor */}
                <div
                  className={`space-y-1 ${
                    isAdminOrLeader ? 'sm:col-span-6' : 'sm:col-span-12'
                  }`}
                >
                  <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Layers className="size-3" /> Filtrar por Setor
                  </label>
                  <Select
                    value={selectedSectorId}
                    onValueChange={handleSectorChange}
                    disabled={availableSectors.length === 0}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background w-full">
                      <SelectValue
                        placeholder={
                          availableSectors.length === 0
                            ? 'Nenhum setor vinculado'
                            : 'Todos os setores'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {availableSectors.length === 0
                          ? 'Nenhum setor vinculado'
                          : 'Todos os setores'}
                      </SelectItem>
                      {availableSectors.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Usuário para Líderes / Admins */}
                {isAdminOrLeader && (
                  <div className="sm:col-span-6 space-y-1">
                    <form
                      onSubmit={handleApplyUserFilter}
                      className="flex gap-2 items-end"
                    >
                      <div className="flex-1 space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                          <UserIcon className="size-3" /> Consultar Usuário
                          (UUID)
                        </label>
                        <Input
                          type="text"
                          placeholder="UUID do usuário ou deixe vazio para você"
                          value={selectedUserId}
                          onChange={e => setSelectedUserId(e.target.value)}
                          className="h-8 text-xs bg-background font-mono"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        className="h-8 text-xs font-semibold px-3"
                        disabled={isLoading}
                      >
                        Filtrar
                      </Button>
                      {hasActiveFilters && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearFilters}
                          className="h-8 px-2 text-xs"
                          title="Limpar filtros"
                        >
                          <RotateCcw className="size-3.5" />
                        </Button>
                      )}
                    </form>
                  </div>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                <Spinner className="size-6 animate-spin text-primary" />
                <span className="text-sm font-medium">
                  Calculando resumo de horas...
                </span>
              </div>
            ) : error ? (
              <div className="py-4 space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSummary()}
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            ) : summary ? (
              <div className="space-y-4">
                {/* Cards de Métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-3.5">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <Timer className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">
                          Tempo Trabalhado
                        </span>
                        {summary.setor_id && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-muted px-1.5 py-0.2 rounded font-medium text-foreground/80">
                            <Layers className="size-2.5 text-primary" />
                            {getSectorName(summary.setor_id)}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
                        {formatDurationSummary(
                          summary.tempo_trabalhado_segundos,
                        )}
                      </p>
                    </div>
                  </div>

                  {periodType === 'week' && isViewingSelf && metaHoras > 0 ? (
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-3.5">
                      <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Target className="size-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">
                            Meta Semanal
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {porcentagemMeta}%
                          </span>
                        </div>
                        <p className="font-mono text-lg font-bold tracking-tight text-foreground">
                          {formatDurationSummary(
                            summary.tempo_trabalhado_segundos,
                          )}{' '}
                          <span className="text-xs font-normal text-muted-foreground">
                            / {metaHoras}h
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-3.5">
                      <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <TrendingUp className="size-5" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground font-medium">
                          Total em Horas Decimais
                        </span>
                        <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
                          {(summary.tempo_trabalhado_segundos / 3600).toFixed(
                            1,
                          )}
                          h
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra de Progresso da Meta Semanal */}
                {periodType === 'week' && isViewingSelf && metaHoras > 0 && (
                  <div className="p-3.5 rounded-lg bg-muted/20 border border-border/40 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progresso da meta semanal</span>
                      <span className="font-medium text-foreground">
                        {porcentagemMeta >= 100 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="size-3.5" /> Meta atingida!
                          </span>
                        ) : (
                          `${porcentagemMeta}% concluído`
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${porcentagemMeta}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
