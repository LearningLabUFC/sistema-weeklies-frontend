import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderKanban,
  History,
  ListTodo,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import Header from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { isAdminRole, isSuperAdminRole } from '@/config/roles';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { assignmentsApi } from '@/features/weeklies/api/assignmentsApi';
import { warningsApi } from '@/features/weeklies/api/warningsApi';
import { WarningsList } from '@/features/weeklies/components/WarningsList';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function WeekliesLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    sectors,
    mySectors,
    selectedSectorId,
    selectedSector,
    setSelectedSectorId,
    isLoading: isLoadingSectors,
  } = useSectorContext();

  const [warningsTotal, setWarningsTotal] = useState(0);
  const [showWarnings, setShowWarnings] = useState(false);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

  const allowedSectors = useMemo(() => {
    if (mySectors !== undefined) {
      return mySectors;
    }
    return sectors;
  }, [mySectors, sectors]);

  const isSuperAdmin = isSuperAdminRole(user?.global_role);
  const hasSectorLink = Boolean(mySectors && mySectors.length > 0);
  const isPureAdmin =
    isSuperAdmin ||
    (!isLoadingSectors && isAdminRole(user?.global_role) && !hasSectorLink);

  useEffect(() => {
    if (isSuperAdmin || isLoadingSectors) return;
    if (mySectors !== undefined) {
      if (mySectors.length > 0) {
        if (
          !selectedSectorId ||
          !mySectors.some(s => s.id === selectedSectorId)
        ) {
          setSelectedSectorId(mySectors[0].id);
        }
      } else if (selectedSectorId) {
        setSelectedSectorId(null);
      }
    }
  }, [
    isSuperAdmin,
    isLoadingSectors,
    mySectors,
    selectedSectorId,
    setSelectedSectorId,
  ]);

  useEffect(() => {
    if (isPureAdmin || (isLoadingSectors && isAdminRole(user?.global_role))) {
      return;
    }

    let isCancelled = false;

    warningsApi
      .getMyWarnings({ pagina: 1, limite: 5 })
      .then(res => {
        if (!isCancelled) {
          setWarningsTotal(res.total || 0);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setWarningsTotal(0);
        }
      });

    assignmentsApi
      .getMyAssignments({
        tipo: 'recebidas',
        status: 'PENDENTE',
        pagina: 1,
        limite: 1,
      })
      .then(res => {
        if (!isCancelled) {
          setPendingInvitesCount(res.total || 0);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setPendingInvitesCount(0);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isPureAdmin, isLoadingSectors, user?.global_role, location.pathname]);

  if (isPureAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isLoadingSectors && isAdminRole(user?.global_role)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isCurrentTab = location.pathname === '/weeklies';
  const isHistoryTab = location.pathname.startsWith('/weeklies/historico');
  const isTasksTab = location.pathname.startsWith('/weeklies/tarefas');

  return (
    <div className="mx-auto w-full max-w-4xl py-6 sm:py-10 space-y-6 animate-in fade-in duration-300">
      <Header
        title="Weeklies"
        subtitle="Gerencie seu relatório da semana, consulte o histórico e acompanhe suas tarefas e colaborações"
      />

      {/* Seletor de Setor Global do Hub */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Setor de Atuação
            </span>
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {selectedSector?.nome || 'Nenhum setor selecionado'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-72">
            {isLoadingSectors ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-2 border rounded-md w-full">
                <Spinner className="w-4 h-4 animate-spin" /> Carregando
                setores...
              </div>
            ) : allowedSectors.length === 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/setores')}
                className="w-full text-xs"
              >
                Explorar catálogo de setores
              </Button>
            ) : (
              <Select
                value={selectedSectorId || ''}
                onValueChange={val => setSelectedSectorId(val || null)}
              >
                <SelectTrigger id="select-weekly-sector" className="w-full">
                  <SelectValue placeholder="Selecione um setor..." />
                </SelectTrigger>
                <SelectContent>
                  {allowedSectors.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome} {!s.ativo && '(Inativo)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Banner Colapsável de Advertências Pessoais */}
      {warningsTotal > 0 && (
        <Card className="border-amber-300 bg-amber-50/70 dark:border-amber-900/70 dark:bg-amber-950/20">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Você possui {warningsTotal}{' '}
                    {warningsTotal === 1
                      ? 'advertência registrada'
                      : 'advertências registradas'}
                  </p>
                  <p className="text-xs text-amber-700/90 dark:text-amber-300/80">
                    Mantenha suas entregas semanais em dia para evitar novas
                    ocorrências.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowWarnings(prev => !prev)}
                className="gap-1.5 text-xs border-amber-300 bg-white/80 hover:bg-white text-amber-900 dark:border-amber-800 dark:bg-slate-900/60 dark:text-amber-200 shrink-0 self-start sm:self-auto"
              >
                {showWarnings ? (
                  <>
                    Ocultar
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Ver detalhes
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>

            {showWarnings && (
              <div className="pt-3 border-t border-amber-200/80 dark:border-amber-900/50">
                <WarningsList mode="me" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Abas de Navegação por Rota */}
      <nav
        aria-label="Navegação do módulo Weeklies"
        className="border-b border-slate-200 dark:border-slate-800"
      >
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Link
            to="/weeklies"
            className={cn(
              'px-3 sm:px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2',
              isCurrentTab
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Esta semana</span>
          </Link>

          <Link
            to="/weeklies/historico"
            className={cn(
              'px-3 sm:px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2',
              isHistoryTab
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <History className="w-4 h-4" />
            <span>Histórico</span>
          </Link>

          <Link
            to="/weeklies/tarefas"
            className={cn(
              'px-3 sm:px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2',
              isTasksTab
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <ListTodo className="w-4 h-4" />
            <span>Tarefas e Colaboração</span>
            {pendingInvitesCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-0.5 text-[11px] px-1.5 py-0 h-5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
              >
                {pendingInvitesCount}
              </Badge>
            )}
          </Link>
        </div>
      </nav>

      {/* Conteúdo da Aba Ativa */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
