import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Crown,
  Edit,
  FolderKanban,
  Mail,
  RefreshCw,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/layout/Header/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { AddMemberModal } from '@/features/sectors/components/AddMemberModal';
import { SectorModal } from '@/features/sectors/components/SectorModal';
import { formatTimestampFortaleza } from '@/features/weeklies/utils/dateUtils';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAsyncMutation } from '@/hooks/useAsyncMutation';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import type { SectorDetail, SectorMemberItem } from '@/types/sectors';

export default function AdminSectorDetail() {
  const { sectorId } = useParams<{ sectorId: string }>();
  const navigate = useNavigate();
  const { showAlertDialog } = useAlertDialog();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const queryFn = useCallback(async (): Promise<SectorDetail> => {
    if (!sectorId) throw new Error('ID do setor não fornecido.');
    return sectorsApi.getById(sectorId);
  }, [sectorId]);

  const queryOptions = useMemo(
    () => ({
      enabled: Boolean(sectorId),
    }),
    [sectorId],
  );

  const {
    data: sector,
    isLoading,
    error,
    refetch,
  } = useAsyncQuery(queryFn, queryOptions);

  const existingMemberIds = useMemo(
    () => sector?.membros.map(m => m.id) || [],
    [sector?.membros],
  );

  // Mutação para alternar papel do membro (S08)
  const roleMutation = useAsyncMutation(
    async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: 'membro' | 'lider';
    }) => {
      if (!sectorId) return;
      return sectorsApi.updateMemberRole(sectorId, userId, { papel: newRole });
    },
    {
      onSuccess: res => {
        showAlertDialog({
          type: 'success',
          title: 'Papel atualizado',
          message:
            res?.mensagem ||
            'O papel do usuário no setor foi alterado com sucesso.',
        });
        refetch();
      },
    },
  );

  // Mutação para remover membro do setor (S07)
  const removeMemberMutation = useAsyncMutation(
    async (userId: string) => {
      if (!sectorId) return;
      return sectorsApi.removeMember(sectorId, userId);
    },
    {
      onSuccess: res => {
        showAlertDialog({
          type: 'success',
          title: 'Membro removido',
          message:
            res?.mensagem ||
            'O vínculo do usuário com o setor foi removido com sucesso.',
        });
        refetch();
      },
    },
  );

  const handleToggleRole = (member: SectorMemberItem) => {
    const newRole = member.papel === 'lider' ? 'membro' : 'lider';
    const actionLabel =
      newRole === 'lider' ? 'promover a Líder' : 'rebaixar a Membro';

    showAlertDialog({
      type: 'confirm',
      title: 'Alterar papel no setor',
      message: `Deseja realmente ${actionLabel} o usuário "${member.nome_completo}"?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        roleMutation.execute({ userId: member.id, newRole });
      },
    });
  };

  const handleRemoveMember = (member: SectorMemberItem) => {
    showAlertDialog({
      type: 'confirm',
      title: 'Remover membro do setor',
      message: `Tem certeza que deseja remover o usuário "${member.nome_completo}" deste setor?`,
      confirmText: 'Sim, remover',
      cancelText: 'Cancelar',
      onConfirm: () => {
        removeMemberMutation.execute(member.id);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium">Carregando detalhes do setor...</p>
      </div>
    );
  }

  if (error || !sector) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/setores')}
          className="gap-2 text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para listagem
        </Button>

        <div className="p-8 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-300">
            Não foi possível acessar o setor
          </h3>
          <p className="text-sm text-rose-600 dark:text-rose-400 max-w-md mx-auto">
            {error?.message || 'Setor não encontrado ou acesso restrito.'}
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
      </div>
    );
  }

  const qtdMembros = sector.membros.filter(m => m.papel === 'membro').length;
  const qtdLideres = sector.membros.filter(m => m.papel === 'lider').length;

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/setores')}
          className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Setores
        </Button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Header
            title={sector.nome}
            subtitle={sector.descricao || 'Sem descrição informada.'}
          />
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="gap-2 text-xs"
            >
              <Edit className="w-4 h-4" />
              Editar Setor
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddMemberModalOpen(true)}
              className="gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <UserPlus className="w-4 h-4" />
              Adicionar Membro
            </Button>
          </div>
        </div>
      </div>

      {/* Indicadores do setor */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Status</span>
              <div className="mt-1">
                <Badge
                  variant={sector.ativo ? 'default' : 'secondary'}
                  className={
                    sector.ativo
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-600'
                  }
                >
                  {sector.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
            <FolderKanban className="w-8 h-8 text-slate-300 dark:text-slate-700" />
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Composição</span>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <span className="flex items-center gap-1 text-indigo-600">
                  <Users className="w-4 h-4" />
                  {qtdMembros} membros
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <Crown className="w-4 h-4" />
                  {qtdLideres} líderes
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-700" />
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Criado em</span>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {formatTimestampFortaleza(sector.criado_em)}
              </div>
            </div>
            <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-700" />
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Membros */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Membros Vinculados ({sector.membros.length})
          </h3>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-32 text-center">Papel</TableHead>
                <TableHead className="w-44 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sector.membros.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-slate-500"
                  >
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    Nenhum membro vinculado a este setor.
                  </TableCell>
                </TableRow>
              ) : (
                sector.membros.map(member => (
                  <TableRow
                    key={member.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {member.nome_completo}
                    </TableCell>

                    <TableCell className="text-slate-600 dark:text-slate-300 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {member.email}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={
                          member.papel === 'lider'
                            ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 font-semibold gap-1'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400'
                        }
                      >
                        {member.papel === 'lider' ? (
                          <>
                            <Crown className="w-3 h-3 text-amber-600" />
                            Líder
                          </>
                        ) : (
                          'Membro'
                        )}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleRole(member)}
                          className="h-8 text-xs gap-1 text-slate-600 hover:text-slate-900"
                          title={
                            member.papel === 'lider'
                              ? 'Rebaixar a Membro'
                              : 'Promover a Líder'
                          }
                          disabled={roleMutation.isMutating}
                        >
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          {member.papel === 'lider'
                            ? 'Tornar membro'
                            : 'Tornar líder'}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMember(member)}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remover do setor"
                          disabled={removeMemberMutation.isMutating}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <SectorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => refetch()}
        sectorToEdit={sector}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        sectorId={sector.id}
        onSuccess={() => refetch()}
        existingMemberIds={existingMemberIds}
      />
    </div>
  );
}
