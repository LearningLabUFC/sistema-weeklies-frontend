import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  Edit2,
  Filter,
  FolderKanban,
  Mail,
  Plus,
  UserPlus,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { TaskModal } from '@/features/tasks/components/TaskModal';
import { TaskStatusBadge } from '@/features/tasks/components/TaskStatusBadge';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { AssignmentsBox } from '@/features/weeklies/components/AssignmentsBox';
import { InviteCollaboratorModal } from '@/features/weeklies/components/InviteCollaboratorModal';
import {
  formatDateCivil,
  formatTimestampFortaleza,
  isPrazoVencido,
} from '@/features/weeklies/utils/dateUtils';
import type { TaskResponse, TaskStatus } from '@/types/weeklies';

type StatusFilter = 'TODOS' | TaskStatus;

export default function MyTasks() {
  const { sectors, mySectors, selectedSectorId } = useSectorContext();

  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filterSectorId, setFilterSectorId] = useState<string>(
    selectedSectorId || 'ALL',
  );
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('TODOS');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Garante que o filtro não selecione um setor ao qual o membro não pertença
  useEffect(() => {
    if (
      filterSectorId !== 'ALL' &&
      mySectors.length > 0 &&
      !mySectors.some(s => s.id === filterSectorId)
    ) {
      const timer = setTimeout(() => {
        setFilterSectorId('ALL');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mySectors, filterSectorId]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'assignments'>('tasks');
  const [taskToInvite, setTaskToInvite] = useState<TaskResponse | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refreshTasks = () => {
    setIsLoading(true);
    setRefreshTrigger(t => t + 1);
  };

  useEffect(() => {
    let isCancelled = false;
    const params: {
      setor_id?: string;
      status?: TaskStatus;
      limite: number;
      pagina: number;
    } = {
      limite: limit,
      pagina: page,
    };

    if (filterSectorId && filterSectorId !== 'ALL') {
      params.setor_id = filterSectorId;
    }
    if (filterStatus && filterStatus !== 'TODOS') {
      params.status = filterStatus;
    }

    tasksApi
      .getMyTasks(params)
      .then(res => {
        if (isCancelled) return;
        setTasks(res.tasks);
        setTotal(res.total);
        setIsLoading(false);
      })
      .catch(err => {
        if (isCancelled) return;
        console.error('Erro ao buscar tarefas:', err);
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [filterSectorId, filterStatus, page, refreshTrigger]);

  const handleCreateClick = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleEditClick = (task: TaskResponse) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const getSectorName = (setorId: string) => {
    const sec =
      mySectors.find(s => s.id === setorId) ||
      sectors.find(s => s.id === setorId);
    return sec ? sec.nome : 'Setor';
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="mx-auto w-full max-w-5xl py-6 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Tarefas e Colaboração"
          subtitle="Gerencie suas tarefas pessoais e convites de colaboração"
        />

        {activeTab === 'tasks' && (
          <Button
            type="button"
            onClick={handleCreateClick}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa (T02)
          </Button>
        )}
      </div>

      {/* Tabs Switcher: Minhas Tarefas vs Convites de Colaboração */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Minhas Tarefas (T01)</span>
            <Badge
              variant="secondary"
              className="ml-1 text-[11px] px-1.5 py-0 h-5"
            >
              {total}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Convites de Colaboração (C01-C03)</span>
          </button>
        </div>
      </div>

      {activeTab === 'assignments' ? (
        <AssignmentsBox onAssignmentAction={refreshTasks} />
      ) : (
        <>
          {/* Barra de Filtros */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-slate-400" />
                  <Select
                    value={filterSectorId}
                    onValueChange={val => {
                      setFilterSectorId(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="filter-sector" className="w-48 text-xs">
                      <SelectValue placeholder="Todos os setores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os setores</SelectItem>
                      {mySectors.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <Select
                    value={filterStatus}
                    onValueChange={(val: StatusFilter) => {
                      setFilterStatus(val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="filter-status" className="w-48 text-xs">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos os status</SelectItem>
                      <SelectItem value="PENDENTE">Pendentes</SelectItem>
                      <SelectItem value="EM_AUDITORIA">Em Auditoria</SelectItem>
                      <SelectItem value="CONCLUIDA">Concluídas</SelectItem>
                      <SelectItem value="REMOVIDA_PELO_LIDER">
                        Removidas pelo Líder
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <span className="text-xs text-slate-500 font-medium self-end md:self-auto">
                {total}{' '}
                {total === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
              </span>
            </CardContent>
          </Card>

          {/* Lista de Tarefas */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Spinner className="w-8 h-8 text-indigo-600" />
              <span className="text-xs text-slate-500">
                Carregando suas tarefas...
              </span>
            </div>
          ) : tasks.length === 0 ? (
            <Card className="border-dashed p-10 text-center space-y-3">
              <CheckSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  Nenhuma tarefa encontrada
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Você não possui tarefas que correspondam aos filtros
                  selecionados. Crie uma nova tarefa ou altere os filtros acima.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateClick}
                className="text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Criar nova tarefa
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => {
                const vencida =
                  task.status === 'PENDENTE' &&
                  isPrazoVencido(task.prazo_conclusao);

                return (
                  <Card
                    key={task.id}
                    className="border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-colors"
                  >
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <TaskStatusBadge status={task.status} />

                          <Badge
                            variant="outline"
                            className="text-[11px] font-medium bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          >
                            {getSectorName(task.setor_id)}
                          </Badge>

                          {vencida && (
                            <Badge
                              variant="destructive"
                              className="text-[11px] gap-1 font-medium bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Prazo Vencido
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                            {task.titulo}
                          </h3>
                          {task.descricao && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap">
                              {task.descricao}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          {task.prazo_conclusao && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Prazo: {formatDateCivil(task.prazo_conclusao)}
                            </span>
                          )}

                          {task.status === 'EM_AUDITORIA' &&
                            task.entrada_auditoria_em && (
                              <span className="text-purple-600 dark:text-purple-400 font-medium">
                                Entrou em auditoria em:{' '}
                                {formatTimestampFortaleza(
                                  task.entrada_auditoria_em,
                                )}
                              </span>
                            )}

                          <span>
                            Criada em:{' '}
                            {formatTimestampFortaleza(task.criado_em)}
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 shrink-0 self-start">
                        {task.status === 'PENDENTE' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(task)}
                            className="gap-1.5 text-xs rounded-xl"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar (T03)</span>
                          </Button>
                        )}

                        {task.status !== 'REMOVIDA_PELO_LIDER' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setTaskToInvite(task)}
                            className="gap-1.5 text-xs rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Convidar</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    Página {page} de {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="text-xs"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="text-xs"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal de Criação / Edição de Tarefa */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultSectorId={
          filterSectorId !== 'ALL' &&
          mySectors.some(s => s.id === filterSectorId)
            ? filterSectorId
            : selectedSectorId && mySectors.some(s => s.id === selectedSectorId)
              ? selectedSectorId
              : mySectors.length > 0
                ? mySectors[0].id
                : null
        }
        onSuccess={refreshTasks}
      />

      {/* Modal T08: Convidar Colaborador */}
      {taskToInvite && (
        <InviteCollaboratorModal
          isOpen={Boolean(taskToInvite)}
          taskId={taskToInvite.id}
          taskTitulo={taskToInvite.titulo}
          onClose={() => setTaskToInvite(null)}
          onSuccess={() => {
            setTaskToInvite(null);
            refreshTasks();
          }}
        />
      )}
    </div>
  );
}
