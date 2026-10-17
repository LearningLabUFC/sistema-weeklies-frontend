import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Filter,
  Inbox,
  RefreshCw,
  User,
  XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { assignmentsApi } from '@/features/weeklies/api/assignmentsApi';
import { AssignmentStatusBadge } from '@/features/weeklies/components/AssignmentStatusBadge';
import { WeeklyPagination } from '@/features/weeklies/components/Pagination';
import { formatTimestampFortaleza } from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import type {
  AssignmentStatus,
  TaskAssignmentListResponse,
} from '@/types/weeklies';

interface AssignmentsBoxProps {
  onAssignmentAction?: () => void;
}

export function AssignmentsBox({ onAssignmentAction }: AssignmentsBoxProps) {
  const { showAlertDialog } = useAlertDialog();

  const [tipo, setTipo] = useState<'recebidas' | 'enviadas'>('recebidas');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'TODOS'>(
    'TODOS',
  );
  const [pagina, setPagina] = useState(1);
  const limite = 10;

  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAssignments =
    useCallback(async (): Promise<TaskAssignmentListResponse> => {
      return assignmentsApi.getMyAssignments({
        tipo,
        status: statusFilter === 'TODOS' ? undefined : statusFilter,
        pagina,
        limite,
      });
    }, [tipo, statusFilter, pagina, limite]);

  const { data, isLoading, error, refetch } = useAsyncQuery(fetchAssignments);

  const handleAccept = (assignmentId: string, taskTitulo?: string | null) => {
    showAlertDialog({
      type: 'confirm',
      title: 'Aceitar convite de colaboração?',
      message: `Deseja aceitar o convite para a tarefa "${taskTitulo || 'Sem título'}"? Uma cópia vinculada será gerada para você.`,
      confirmText: 'Aceitar Convite',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: async () => {
        try {
          setProcessingId(assignmentId);
          await assignmentsApi.accept(assignmentId);
          showAlertDialog({
            type: 'success',
            title: 'Convite Aceito',
            message:
              'Você aceitou o convite de colaboração. A tarefa já foi vinculada a você!',
          });
          await refetch();
          onAssignmentAction?.();
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : 'Falha ao aceitar convite';
          showAlertDialog({
            type: 'error',
            title: 'Erro ao aceitar convite',
            message: msg,
          });
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleReject = (assignmentId: string, taskTitulo?: string | null) => {
    showAlertDialog({
      type: 'confirm',
      title: 'Recusar convite de colaboração?',
      message: `Deseja recusar o convite para a tarefa "${taskTitulo || 'Sem título'}"?`,
      confirmText: 'Recusar Convite',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: async () => {
        try {
          setProcessingId(assignmentId);
          await assignmentsApi.reject(assignmentId);
          showAlertDialog({
            type: 'info',
            title: 'Convite Recusado',
            message: 'O convite de colaboração foi recusado.',
          });
          await refetch();
          onAssignmentAction?.();
        } catch (err: unknown) {
          const msg =
            err instanceof Error ? err.message : 'Falha ao recusar convite';
          showAlertDialog({
            type: 'error',
            title: 'Erro ao recusar convite',
            message: msg,
          });
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / limite)) : 1;

  return (
    <div className="space-y-6" data-testid="assignments-box">
      {/* Sub-toggle and filters header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
        {/* Toggle Recebidas / Enviadas */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setTipo('recebidas');
              setPagina(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              tipo === 'recebidas'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Recebidos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTipo('enviadas');
              setPagina(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              tipo === 'enviadas'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Enviados</span>
          </button>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-medium text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {(
            ['TODOS', 'PENDENTE', 'ACEITA', 'RECUSADA', 'EXPIRADA'] as const
          ).map(status => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setPagina(1);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {status === 'TODOS'
                ? 'Todos'
                : status === 'PENDENTE'
                  ? 'Pendentes'
                  : status === 'ACEITA'
                    ? 'Aceitos'
                    : status === 'RECUSADA'
                      ? 'Recusados'
                      : 'Expirados'}
            </button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-xs h-7 ml-2"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm">Carregando convites de colaboração...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Erro ao carregar convites</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !error && data && (
        <>
          {data.atribuicoes.length === 0 ? (
            <div className="py-16 text-center space-y-3 border border-dashed rounded-2xl p-8 border-slate-200 dark:border-slate-800">
              <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="font-semibold text-foreground">
                Nenhum convite encontrado
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {tipo === 'recebidas'
                  ? 'Você não possui convites de colaboração recebidos com este filtro.'
                  : 'Você ainda não enviou nenhum convite de colaboração com este filtro.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.atribuicoes.map(assignment => {
                const isPendingReceived =
                  tipo === 'recebidas' && assignment.status === 'PENDENTE';
                const isBusy = processingId === assignment.id;

                return (
                  <Card
                    key={assignment.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">
                            {assignment.task_titulo || 'Tarefa sem título'}
                          </h4>
                          <AssignmentStatusBadge status={assignment.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {tipo === 'recebidas' ? (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              De:{' '}
                              <strong>
                                {assignment.solicitante_nome ||
                                  assignment.solicitante_id}
                              </strong>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              Para:{' '}
                              <strong>
                                {assignment.atribuido_nome ||
                                  assignment.atribuido_id}
                              </strong>
                            </span>
                          )}

                          <span>
                            • Enviado em:{' '}
                            {formatTimestampFortaleza(assignment.criado_em)}
                          </span>

                          {assignment.respondido_em && (
                            <span>
                              • Respondido em:{' '}
                              {formatTimestampFortaleza(
                                assignment.respondido_em,
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons (only for pending received invitations) */}
                      {isPendingReceived && (
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAccept(
                                assignment.id,
                                assignment.task_titulo,
                              )
                            }
                            disabled={isBusy}
                            className="text-xs h-8 gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aceitar</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleReject(
                                assignment.id,
                                assignment.task_titulo,
                              )
                            }
                            disabled={isBusy}
                            className="text-xs h-8 gap-1.5 rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Recusar</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <WeeklyPagination
            currentPage={pagina}
            totalPages={totalPages}
            onPageChange={setPagina}
          />
        </>
      )}
    </div>
  );
}
