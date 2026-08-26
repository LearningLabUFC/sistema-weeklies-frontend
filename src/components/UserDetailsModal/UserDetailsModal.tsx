import { useState } from 'react';
import { ROLE_IDS } from '@/data/data';
import {
  X,
  Trash2,
  ShieldAlert,
  Calendar,
  Mail,
  GraduationCap,
  Shield,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import type { Usuario } from '@/pages/admin/Participants/Participants';
import { useAlertDialog } from '@/context/AlertDialogContext';

// Importação do seu hook de autenticação real
import { useAuth } from '@/context/AuthContext';

interface UserDetailsModalProps {
  user: Usuario | null;
  onClose: () => void;
  onUpdate: () => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const getRoleStyle = (role: string) => {
  const styles: Record<string, string> = {
    aluno: 'bg-[#457EFF]/10 text-[#457EFF] border-[#457EFF]/20',
    admin: 'bg-[#8204EE]/10 text-[#8204EE] border-[#8204EE]/20',
    super_admin: 'bg-[#F51BA3]/10 text-[#F51BA3] border-[#F51BA3]/20',
    leader:
      'bg-[#FFBF00]/10 text-[#D49E00] border-[#FFBF00]/20 dark:text-[#FFBF00]',
  };
  return (
    styles[role.toLowerCase()] ||
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
  );
};

export function UserDetailsModal({
  user,
  onClose,
  onUpdate,
}: UserDetailsModalProps) {
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showAlertDialog } = useAlertDialog();

  const { user: currentUser } = useAuth();

  if (!user) return null;

  const isSuperAdmin = currentUser?.global_role === ROLE_IDS.SUPER_ADMIN;
  const isAdmin = currentUser?.global_role === ROLE_IDS.ADMIN || isSuperAdmin;
  const isSelf = currentUser?.id === user.id;

  const targetIsSuperAdmin =
    user.role_nome === 'super_admin' || user.role_nome === 'coordenadora';

  const canManageUser = isSuperAdmin || (isAdmin && !targetIsSuperAdmin);

  const handleRoleChange = async (newRole: string) => {
    try {
      setIsUpdatingRole(true);
      await api.patch(`/admin/users/${user.id}/role`, { role_nome: newRole });
      onUpdate();

      showAlertDialog({
        type: 'success',
        title: 'Cargo alterado',
        message: `O cargo de ${user.nome_completo} foi alterado com sucesso.`,
      });
    } catch (error: unknown) {
      console.error('Erro ao alterar cargo:', error);

      type ApiError = {
        response?: {
          status?: number;
          data?: {
            detail?: string;
          };
        };
      };

      const apiError = error as ApiError;
      const status = apiError.response?.status;
      const detailMessage = apiError.response?.data?.detail;

      if (typeof detailMessage === 'string') {
        let alertTitle = 'Erro na operação';
        let alertType: 'warning' | 'error' = 'error';

        if (status === 400) {
          alertTitle = 'Ação não permitida';
          alertType = 'warning';
        } else if (status === 403 || detailMessage.includes('super_admin')) {
          alertTitle = 'Permissão Negada';
          alertType = 'error';
        }

        showAlertDialog({
          type: alertType,
          title: alertTitle,
          message: detailMessage,
        });
        return;
      }

      showAlertDialog({
        type: 'error',
        title: 'Erro ao alterar cargo',
        message:
          'Não foi possível alterar o cargo. Verifique se você tem permissão ou se este é o último admin ativo.',
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const executeDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/admin/users/${user.id}`);
      onUpdate();
      onClose();

      showAlertDialog({
        type: 'success',
        title: 'Usuário inativado',
        message: 'O usuário foi removido do sistema com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      showAlertDialog({
        type: 'error',
        title: 'Erro ao inativar',
        message:
          'Ocorreu um problema ao inativar o usuário. Tente novamente mais tarde.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    showAlertDialog({
      type: 'warning',
      title: 'Você tem certeza?',
      message: `Isso inativará a conta de ${user.nome_completo} e removerá seu acesso completo ao sistema.`,
      showCancel: true,
      confirmText: 'Sim, inativar',
      cancelText: 'Cancelar',
      onConfirm: executeDelete,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            Detalhes do Participante
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-800 shadow-lg">
              <AvatarImage src={user.foto_perfil} alt={user.nome_completo} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-3xl font-medium">
                {getInitials(user.nome_completo)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-50 text-2xl">
                {user.nome_completo}
              </h4>
              <Badge
                variant="outline"
                className={`mt-2 px-3 py-1 text-sm border ${getRoleStyle(user.role_nome)}`}
              >
                {user.role_nome.toUpperCase()}
              </Badge>
            </div>
          </div>

          <Separator className="dark:bg-slate-800/60" />

          <div className="space-y-4">
            <h5 className="font-semibold text-slate-900 dark:text-slate-50">
              Informações Cadastrais
            </h5>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-indigo-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">Email</span>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                <GraduationCap className="w-5 h-5 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">
                    Curso & Matrícula
                  </span>
                  <span className="text-sm font-medium">
                    {user.curso_nome || 'N/A'} - {user.matricula || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">
                    Data de Ingresso
                  </span>
                  <span className="text-sm font-medium">
                    {user.data_ingresso
                      ? new Date(user.data_ingresso).toLocaleDateString('pt-BR')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isAdmin && !isSelf && (
            <>
              <Separator className="dark:bg-slate-800/60" />
              <div className="space-y-4">
                <h5 className="font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Controles Administrativos
                </h5>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-slate-500 dark:text-slate-400">
                    Alterar Cargo do Usuário
                  </label>
                  <Select
                    defaultValue={user.role_nome}
                    onValueChange={handleRoleChange}
                    disabled={isUpdatingRole || !canManageUser}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aluno">Aluno</SelectItem>
                      <SelectItem value="lider">Líder</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      {/* Essa opção aparece automaticamente se isSuperAdmin for verdadeiro no seu useAuth */}
                      {isSuperAdmin && (
                        <SelectItem value="super_admin">
                          Super Administrador
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {!canManageUser ? (
                    <p className="text-xs text-rose-500 dark:text-rose-400">
                      * Apenas um Super Administrador pode alterar os dados de
                      outro Super Administrador.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">
                      * Proteção contra auto-rebaixamento está ativa no sistema.
                    </p>
                  )}
                </div>

                {isSuperAdmin && (
                  <div className="mt-6 p-4 border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 rounded-xl space-y-3">
                    <h6 className="text-sm font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Zona de Perigo
                    </h6>
                    <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                      Inativar este usuário removerá completamente seu acesso ao
                      sistema. Esta ação não pode ser desfeita facilmente.
                    </p>

                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto mt-2"
                      disabled={isDeleting}
                      onClick={handleDeleteClick}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Inativar Usuário
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
