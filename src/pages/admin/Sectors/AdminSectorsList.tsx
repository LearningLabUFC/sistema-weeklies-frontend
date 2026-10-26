import {
  AlertCircle,
  Crown,
  Edit,
  FolderKanban,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { isSuperAdminRole } from '@/config/roles';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { SectorModal } from '@/features/sectors/components/SectorModal';
import { WeeklyPagination } from '@/features/weeklies/components/Pagination';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useAuth } from '@/hooks/useAuth';
import type { SectorListItem, SectorListResponse } from '@/types/sectors';

export default function AdminSectorsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlertDialog } = useAlertDialog();

  const isSuperAdmin = isSuperAdminRole(user?.global_role);

  const [pagina, setPagina] = useState(1);
  const limite = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectorToEdit, setSectorToEdit] = useState<SectorListItem | null>(null);

  const queryFn = useCallback(async (): Promise<SectorListResponse> => {
    return sectorsApi.list({ pagina, limite });
  }, [pagina, limite]);

  const { data, isLoading, error, refetch } = useAsyncQuery(queryFn);

  const deleteMutation = useAsyncMutation(
    async (sectorId: string) => {
      return sectorsApi.delete(sectorId);
    },
    {
      onSuccess: res => {
        showAlertDialog({
          type: 'success',
          title: 'Setor desativado',
          message: res.mensagem || 'O setor foi desativado com sucesso.',
        });
        refetch();
      },
    },
  );

  const handleCreate = () => {
    setSectorToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sector: SectorListItem) => {
    setSectorToEdit(sector);
    setIsModalOpen(true);
  };

  const handleDelete = (sector: SectorListItem) => {
    showAlertDialog({
      type: 'confirm',
      title: 'Desativar setor',
      message: `Tem certeza que deseja desativar o setor "${sector.nome}"? Usuários vinculados não poderão mais submeter weeklies neste setor.`,
      confirmText: 'Sim, desativar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        deleteMutation.execute(sector.id);
      },
    });
  };

  const totalPages = data ? Math.ceil(data.total / limite) : 1;

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Header
          title="Gestão de Setores"
          subtitle="Cadastre novos setores, configure ativação e gerencie vínculos e líderes"
        />
        <Button
          onClick={handleCreate}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Setor
        </Button>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium">Carregando setores...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-semibold text-rose-900 dark:text-rose-300">
            Erro ao carregar setores
          </h3>
          <p className="text-sm text-rose-600 dark:text-rose-400 max-w-md mx-auto">
            {error.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 border-rose-300 text-rose-700 hover:bg-rose-100"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !error && data && (
        <div className="space-y-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableHead>Setor</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-32 text-center">Membros</TableHead>
                  <TableHead className="w-32 text-center">Líderes</TableHead>
                  <TableHead className="w-48 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.setores.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-slate-500"
                    >
                      <FolderKanban className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      Nenhum setor cadastrado até o momento.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.setores.map(sector => (
                    <TableRow
                      key={sector.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {sector.nome}
                        </div>
                        {sector.descricao && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {sector.descricao}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant={sector.ativo ? 'default' : 'secondary'}
                          className={
                            sector.ativo
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }
                        >
                          {sector.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{sector.qtd_membros}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                          <span>{sector.qtd_lideres}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigate(`/admin/setores/${sector.id}`)
                            }
                            className="h-8 text-xs gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          >
                            <Users className="w-3.5 h-3.5" />
                            Membros
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(sector)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                            title="Editar setor"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>

                          {isSuperAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(sector)}
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Desativar setor (Soft Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <WeeklyPagination
            currentPage={pagina}
            totalPages={totalPages}
            onPageChange={setPagina}
          />
        </div>
      )}

      <SectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
        sectorToEdit={sectorToEdit}
      />
    </div>
  );
}
